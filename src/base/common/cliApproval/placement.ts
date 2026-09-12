import type { ITaskModelData, TaskObjectSchema } from '../../../core/type';
import type { CliCreateHeading, CliCreateItem, CliCreateProject, CliCreateTask, CliItemPosition } from './protocol';

/**
 * The single source of truth for "may this item live under that parent".
 *
 * Three consumers share it and must agree, or a request that the CLI accepts
 * and the approval UI renders as valid blows up at apply time:
 *
 * - `cli/core/approval.ts`   — pre-flight, so the CLI fails before submitting
 * - `cliApprovalModel.ts`    — approval UI preview, marks the op invalid
 * - `toItemPosition`         — the last gate on the write path (the real one)
 *
 * The first two exist for feedback quality; only the third is on the path
 * every mutation must cross. Do not drop it as "duplicated".
 *
 * Errors are returned as codes, not messages: the CLI prints English, the
 * renderer localizes. Everything here stays environment agnostic.
 */
export type PlacementErrorCode =
  | 'positionReferenceMissing'
  | 'parentMissing'
  | 'parentType'
  | 'positionSelf'
  | 'nestingTooDeep'
  | 'subjectHasChildren'
  | 'moveIntoTask'
  | 'subtaskParentLocked';

/** what is being placed: an existing item (move) or one about to be created */
export interface PlacementSubject {
  type: TaskObjectSchema['type'];
  /** uid of the existing item; omitted when the item does not exist yet */
  uid?: string;
  /** whether the item brings children along (a task with subtasks) */
  hasChildren?: boolean;
}

export type PlacementMode = 'create' | 'move';

function hasValidTaskNesting(task: CliCreateTask, allowChildren = true): boolean {
  const children = task.children ?? [];
  if (!allowChildren && children.length > 0) {
    return false;
  }
  return children.every((child) => hasValidTaskNesting(child, false));
}

function headingHasValidTaskNesting(heading: CliCreateHeading): boolean {
  return (heading.children ?? []).every((task) => hasValidTaskNesting(task));
}

function projectHasValidTaskNesting(project: CliCreateProject): boolean {
  return (project.children ?? []).every((child) =>
    child.type === 'heading' ? headingHasValidTaskNesting(child) : hasValidTaskNesting(child)
  );
}

/** Runtime invariant for imported trees; protocol types intentionally remain recursive. */
export function createItemHasValidTaskNesting(item: CliCreateItem): boolean {
  switch (item.type) {
    case 'task':
      return hasValidTaskNesting(item);
    case 'heading':
      return headingHasValidTaskNesting(item);
    case 'project':
      return projectHasValidTaskNesting(item);
  }
}

/**
 * Nesting rules for tasks:
 *
 * - a task may be *created* under another task (one level of subtasks)
 * - a task may never be *moved* under another task
 * - a subtask's parent is locked: it can only be reordered among its siblings
 *
 * Because the only way to become a subtask is creation, and creation checks
 * the parent's depth at that moment, "at most one task in a parent chain" is
 * an invariant local validation alone can hold — no concurrent edit can
 * deepen an existing chain.
 */
const ALLOWED_PARENTS: Record<TaskObjectSchema['type'], Array<TaskObjectSchema['type'] | 'root'>> = {
  task: ['root', 'area', 'project', 'projectHeading', 'task'],
  projectHeading: ['project'],
  project: ['root', 'area'],
  area: ['root'],
};

function parentOf(data: ITaskModelData, item: TaskObjectSchema | undefined): TaskObjectSchema | undefined {
  const parentId: string | undefined = item && 'parentId' in item ? item.parentId : undefined;
  return parentId ? data.taskObjectMap.get(parentId) : undefined;
}

/** a task whose parent is itself a task */
export function isSubTask(data: ITaskModelData, item: TaskObjectSchema | undefined): boolean {
  return item?.type === 'task' && parentOf(data, item)?.type === 'task';
}

/** the sibling a before/after position points at */
export function resolvePositionReference(
  data: ITaskModelData,
  position: CliItemPosition
): TaskObjectSchema | undefined {
  if (position.type === 'afterElement') {
    return data.taskObjectUidMap.get(position.previousElementUid);
  }
  if (position.type === 'beforeElement') {
    return data.taskObjectUidMap.get(position.nextElementUid);
  }
  return undefined;
}

/** the container a position resolves to; undefined means the root / inbox */
export function resolvePositionParent(data: ITaskModelData, position: CliItemPosition): TaskObjectSchema | undefined {
  if (position.type === 'firstElement') {
    return position.parentUid ? data.taskObjectUidMap.get(position.parentUid) : undefined;
  }
  return parentOf(data, resolvePositionReference(data, position));
}

/** returns an error code, or null when the placement is allowed */
export function checkPlacement(
  data: ITaskModelData,
  subject: PlacementSubject,
  position: CliItemPosition,
  mode: PlacementMode
): PlacementErrorCode | null {
  const reference = resolvePositionReference(data, position);
  if (position.type !== 'firstElement' && !reference) {
    return 'positionReferenceMissing';
  }
  if (reference && subject.uid && reference.uid === subject.uid) {
    return 'positionSelf';
  }
  if (position.type === 'firstElement' && position.parentUid && !resolvePositionParent(data, position)) {
    return 'parentMissing';
  }

  const parent = resolvePositionParent(data, position);
  if (!ALLOWED_PARENTS[subject.type].includes(parent?.type ?? 'root')) {
    return 'parentType';
  }

  if (parent?.type === 'task') {
    // one level of subtasks only
    if (isSubTask(data, parent)) {
      return 'nestingTooDeep';
    }
    // the subject would drag its own children down to a third level
    if (subject.hasChildren) {
      return 'subjectHasChildren';
    }
  }

  if (mode === 'move') {
    const current = subject.uid ? data.taskObjectUidMap.get(subject.uid) : undefined;
    const parentChanges =
      (parent?.id ?? undefined) !== (current && 'parentId' in current ? current.parentId : undefined);
    if (parentChanges) {
      // an existing task can never be reparented into a task…
      if (parent?.type === 'task') {
        return 'moveIntoTask';
      }
      // …and a subtask can never leave the task it was created under
      if (isSubTask(data, current)) {
        return 'subtaskParentLocked';
      }
    }
  }

  return null;
}
