import type { TreeID } from 'loro-crdt';
import type { ITaskModelData, TaskInfo } from '../type';

export type ViewGroupKind = 'noParent' | 'area' | 'project';

/**
 * A bucket of view tasks under a shared container. View results are
 * tasks-only (no projects), so each group carries `tasks` directly instead of
 * a `{ type: 'task' | 'project' }` union.
 */
export interface ViewGroup {
  /**
   * Synthetic id for keying:
   * - 'noParent'     — orphan / inbox tasks (no header)
   * - 'area:<id>'    — tasks parented (directly) to an area
   * - 'project:<id>' — tasks parented to a project or one of its headings
   */
  id: string;
  kind: ViewGroupKind;
  /** The container's id when kind ≠ 'noParent', else null. */
  parentId: TreeID | null;
  title: string;
  tasks: TaskInfo[];
}

interface GroupKey {
  kind: ViewGroupKind;
  parentId: TreeID | null;
  title: string;
}

function resolveGroupKey(modelData: ITaskModelData, task: TaskInfo): GroupKey {
  const parentId = task.parentId;
  if (!parentId) {
    return { kind: 'noParent', parentId: null, title: '' };
  }
  const parent = modelData.taskObjectMap.get(parentId);
  if (!parent) {
    return { kind: 'noParent', parentId: null, title: '' };
  }
  if (parent.type === 'project') {
    return { kind: 'project', parentId: parentId as TreeID, title: parent.title ?? '' };
  }
  if (parent.type === 'projectHeading') {
    // Tasks under a heading belong to the enclosing project's group.
    const projectId = parent.parentId as TreeID | undefined;
    if (projectId) {
      const projectNode = modelData.taskObjectMap.get(projectId);
      return {
        kind: 'project',
        parentId: projectId,
        title: projectNode?.type === 'project' ? (projectNode.title ?? '') : '',
      };
    }
    return { kind: 'noParent', parentId: null, title: '' };
  }
  if (parent.type === 'area') {
    return { kind: 'area', parentId: parentId as TreeID, title: parent.title ?? '' };
  }
  // Sub-tasks (parented to another task) fall through as orphans.
  return { kind: 'noParent', parentId: null, title: '' };
}

function makeGroupId(kind: ViewGroupKind, parentId: TreeID | null): string {
  if (kind === 'noParent') return 'noParent';
  return `${kind}:${parentId}`;
}

/**
 * Bucket view tasks by their container. Output order:
 *   1. the orphan/inbox bucket (no header)
 *   2. area buckets, in the order each area first appears
 *   3. project buckets, in the order each project first appears
 */
export function groupViewItems(tasks: TaskInfo[], modelData: ITaskModelData): ViewGroup[] {
  const groupMap = new Map<string, ViewGroup>();
  const areaOrder: string[] = [];
  const projectOrder: string[] = [];

  for (const task of tasks) {
    const key = resolveGroupKey(modelData, task);
    const id = makeGroupId(key.kind, key.parentId);
    let group = groupMap.get(id);
    if (!group) {
      group = { id, kind: key.kind, parentId: key.parentId, title: key.title, tasks: [] };
      groupMap.set(id, group);
      if (key.kind === 'area') areaOrder.push(id);
      else if (key.kind === 'project') projectOrder.push(id);
    }
    group.tasks.push(task);
  }

  const ordered: ViewGroup[] = [];
  const noParent = groupMap.get('noParent');
  if (noParent) ordered.push(noParent);
  for (const id of areaOrder) {
    const group = groupMap.get(id);
    if (group) ordered.push(group);
  }
  for (const id of projectOrder) {
    const group = groupMap.get(id);
    if (group) ordered.push(group);
  }
  return ordered;
}
