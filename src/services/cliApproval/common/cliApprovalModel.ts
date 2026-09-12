import type { CliExplanation } from '@/base/common/cliApproval/explanation';
import {
  checkPlacement,
  createItemHasValidTaskNesting,
  PlacementErrorCode,
  PlacementMode,
  PlacementSubject,
  resolvePositionParent,
  resolvePositionReference,
} from '@/base/common/cliApproval/placement';
import {
  CliAreaUpdatePayload,
  CliChangeOp,
  CliChangeRequest,
  CliCreateHeading,
  CliCreateItem,
  CliCreateProject,
  CliCreateTask,
  CliHeadingUpdatePayload,
  CliItemPosition,
  CliProjectUpdatePayload,
  CliTaskUpdatePayload,
} from '@/base/common/cliApproval/protocol';
import {
  CreateAreaSchema,
  CreateProjectHeadingSchema,
  CreateProjectSchema,
  CreateTaskSchema,
  ITaskModelData,
  ItemPosition,
  TaskObjectSchema,
  UpdateAreaSchema,
  UpdateProjectHeadingSchema,
  UpdateProjectSchema,
  UpdateTaskSchema,
} from '@/core/type';
import { localize } from '@/nls';
import type { TreeID } from 'loro-crdt';

export interface CliApprovalScope {
  type: 'project' | 'area';
  uid: string;
  title: string;
}

export type CliApprovalEntityType = 'task' | 'project' | 'area' | 'projectHeading';

export interface CliApprovalEntityRef {
  type: CliApprovalEntityType;
  title: string;
  /** stable uid used by the CLI; null for items that do not exist yet */
  uid: string | null;
}

export interface CliApprovalLocationView {
  /** container chain, outermost first (area → project → heading → parent task) */
  path: CliApprovalEntityRef[];
  /** which root the item falls back to when `path` is empty */
  root: 'inbox' | 'root';
  /** localized root name (Inbox / Root) shown when `path` is empty */
  rootLabel: string;
  /** placement among siblings; null = unspecified (append semantics) */
  anchor: { relation: 'first' } | { relation: 'before' | 'after'; item: CliApprovalEntityRef } | null;
}

export interface CliApprovalFieldChangeView {
  field: 'title' | 'notes' | 'startDate' | 'dueDate' | 'tags' | 'status';
  label: string;
  /** formatted current value; null on create ops (nothing to diff against) */
  from: string | null;
  to: string;
}

export interface CliApprovalMoveView {
  /** where the item currently lives */
  from: CliApprovalLocationView;
  to: CliApprovalLocationView;
}

export interface CliApprovalTreeNodeView {
  type: 'task' | 'heading' | 'project';
  title: string;
  /** initial field values (dates / tags / notes), `from` always null */
  fields: CliApprovalFieldChangeView[];
  children: CliApprovalTreeNodeView[];
}

export interface CliApprovalOpView {
  /** {@link CliChangeOp.id}; the handle every approve / reject ref uses */
  id: string;
  type: CliChangeOp['type'];
  /** drives the action badge styling */
  kind: 'create' | 'update' | 'move' | 'delete';
  /** localized action verb, e.g. `New task` / `Update` / `Move` / `Delete` */
  action: string;
  /** the item the op targets; null when it cannot be resolved (or for multi-item creates) */
  entity: CliApprovalEntityRef | null;
  /** raw uid, shown when the target cannot be resolved anymore */
  unresolvedUid: string | null;
  /** field diffs; `from` is null on create ops */
  changes: CliApprovalFieldChangeView[];
  /** where a created item lands / where a deleted item lives */
  location: CliApprovalLocationView | null;
  /** set when an update changes the item's position */
  move: CliApprovalMoveView | null;
  /** created subtree for create-items ops */
  tree: CliApprovalTreeNodeView[] | null;
  invalidReason: string | null;
  scope: CliApprovalScope | null;
}

export interface CliApprovalRequestView {
  explanation?: CliExplanation;
  requestId: string;
  createdAt: number;
  databaseId: string;
  ops: CliApprovalOpView[];
  invalid: boolean;
  /** distinct scopes this request touches, for page banners / filtering */
  scopes: CliApprovalScope[];
}

function findByUid(data: ITaskModelData, uid: string): TaskObjectSchema | undefined {
  return data.taskObjectUidMap.get(uid);
}

/**
 * The page a change belongs to: the project / area that (directly or through
 * a heading / subtask chain) contains the item. Inbox items have no scope.
 */
export function resolveScope(data: ITaskModelData, item: TaskObjectSchema): CliApprovalScope | null {
  let current: TaskObjectSchema | undefined = item;
  while (current) {
    if (current.type === 'project') {
      return { type: 'project', uid: current.uid, title: current.title };
    }
    if (current.type === 'area') {
      return { type: 'area', uid: current.uid, title: current.title };
    }
    const parentId: string | undefined = (current as { parentId?: string }).parentId;
    current = parentId ? data.taskObjectMap.get(parentId) : undefined;
  }
  return null;
}

/**
 * Deletion requests belong to the containing scope, never to the entity that
 * will disappear after approval. This also keeps project deletion ready to
 * reuse the same rule when that operation is added to the CLI protocol.
 */
function resolveDeletionScope(data: ITaskModelData, item: TaskObjectSchema): CliApprovalScope | null {
  const parentId: string | undefined = (item as { parentId?: string }).parentId;
  const parent = parentId ? data.taskObjectMap.get(parentId) : undefined;
  return parent ? resolveScope(data, parent) : null;
}

function formatDate(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return localize('cliApproval.value.none', 'none');
  }
  const date = new Date(value);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

const inboxLabel = () => localize('cliApproval.value.inbox', 'Inbox');
const rootLabel = () => localize('cliApproval.value.root', 'Root');
const noneValue = () => localize('cliApproval.value.none', 'none');

const ACTION_LABELS = {
  createTask: () => localize('cliApproval.action.createTask', 'New task'),
  createProject: () => localize('cliApproval.action.createProject', 'New project'),
  createHeading: () => localize('cliApproval.action.createHeading', 'New heading'),
  createArea: () => localize('cliApproval.action.createArea', 'New area'),
  update: () => localize('cliApproval.action.update', 'Update'),
  move: () => localize('cliApproval.action.move', 'Move'),
  delete: () => localize('cliApproval.action.delete', 'Delete'),
};

const FIELD_LABELS: Record<CliApprovalFieldChangeView['field'], () => string> = {
  title: () => localize('cliApproval.field.title', 'Title'),
  notes: () => localize('cliApproval.field.notes', 'Notes'),
  startDate: () => localize('cliApproval.field.startDate', 'Start date'),
  dueDate: () => localize('cliApproval.field.dueDate', 'Due date'),
  tags: () => localize('cliApproval.field.tags', 'Tags'),
  status: () => localize('cliApproval.field.status', 'Status'),
};

function fieldChange(
  field: CliApprovalFieldChangeView['field'],
  from: string | null,
  to: string
): CliApprovalFieldChangeView {
  return { field, label: FIELD_LABELS[field](), from, to };
}

function formatText(value: string | undefined): string {
  return value ? value : noneValue();
}

function formatTags(tags: string[] | undefined): string {
  return tags && tags.length > 0 ? tags.join(', ') : noneValue();
}

function entityRef(item: TaskObjectSchema): CliApprovalEntityRef {
  return { type: item.type, title: item.title, uid: item.uid };
}

/** container chain of an item, outermost first */
function containerPath(data: ITaskModelData, container: TaskObjectSchema | undefined): CliApprovalEntityRef[] {
  const path: CliApprovalEntityRef[] = [];
  let current = container;
  while (current) {
    path.unshift(entityRef(current));
    const parentId: string | undefined = (current as { parentId?: string }).parentId;
    current = parentId ? data.taskObjectMap.get(parentId) : undefined;
  }
  return path;
}

function rootFor(itemType: TaskObjectSchema['type']): 'inbox' | 'root' {
  return itemType === 'task' ? 'inbox' : 'root';
}

function rootLabelFor(itemType: TaskObjectSchema['type']): string {
  return itemType === 'task' ? inboxLabel() : rootLabel();
}

function updateChanges(
  payload: CliTaskUpdatePayload | CliProjectUpdatePayload | CliHeadingUpdatePayload | CliAreaUpdatePayload,
  current: TaskObjectSchema
): CliApprovalFieldChangeView[] {
  const changes: CliApprovalFieldChangeView[] = [];
  const values = current as { title: string; notes?: string; startDate?: number; dueDate?: number; tags?: string[] };
  const fields = payload as CliTaskUpdatePayload;
  if (fields.title !== undefined) {
    changes.push(fieldChange('title', formatText(values.title), fields.title));
  }
  if (fields.notes !== undefined) {
    changes.push(fieldChange('notes', formatText(values.notes), formatText(fields.notes)));
  }
  if (fields.startDate !== undefined) {
    changes.push(fieldChange('startDate', formatDate(values.startDate), formatDate(fields.startDate)));
  }
  if (fields.dueDate !== undefined) {
    changes.push(fieldChange('dueDate', formatDate(values.dueDate), formatDate(fields.dueDate)));
  }
  if (fields.tags !== undefined) {
    changes.push(fieldChange('tags', formatTags(values.tags), formatTags(fields.tags)));
  }
  if (fields.status !== undefined) {
    changes.push(fieldChange('status', current.type === 'task' ? current.status : noneValue(), fields.status));
  }
  // A field the request sets to the value it already holds is not a change. The
  // request may have been queued before someone edited the item by hand, or the
  // CLI may simply have been told to set what was already there.
  return changes.filter((change) => change.from !== change.to);
}

/** initial values of a created item, rendered as `from`-less changes */
function createChanges(item: {
  notes?: string;
  startDate?: number;
  dueDate?: number;
  tags?: string[];
}): CliApprovalFieldChangeView[] {
  const changes: CliApprovalFieldChangeView[] = [];
  if (item.startDate !== undefined) {
    changes.push(fieldChange('startDate', null, formatDate(item.startDate)));
  }
  if (item.dueDate !== undefined) {
    changes.push(fieldChange('dueDate', null, formatDate(item.dueDate)));
  }
  if (item.tags && item.tags.length > 0) {
    changes.push(fieldChange('tags', null, item.tags.join(', ')));
  }
  if (item.notes) {
    changes.push(fieldChange('notes', null, item.notes));
  }
  return changes;
}

function treeNode(item: CliCreateItem): CliApprovalTreeNodeView {
  const children: CliCreateItem[] = item.children ?? [];
  return {
    type: item.type,
    title: item.title,
    fields: item.type === 'heading' ? [] : createChanges(item),
    children: children.map(treeNode),
  };
}

const positionReference = resolvePositionReference;
const positionParent = resolvePositionParent;

const PLACEMENT_MESSAGES: Record<PlacementErrorCode, () => string> = {
  positionReferenceMissing: () =>
    localize('cliApproval.invalid.positionReferenceMissing', 'Position reference no longer exists'),
  parentMissing: () => localize('cliApproval.invalid.parentMissing', 'Parent no longer exists'),
  parentType: () => localize('cliApproval.invalid.parentType', 'Invalid parent type'),
  positionSelf: () => localize('cliApproval.invalid.positionSelf', 'An item cannot be positioned relative to itself'),
  nestingTooDeep: () => localize('cliApproval.invalid.nestingTooDeep', 'A subtask cannot have subtasks of its own'),
  subjectHasChildren: () =>
    localize('cliApproval.invalid.subjectHasChildren', 'A task with subtasks cannot be nested under another task'),
  moveIntoTask: () => localize('cliApproval.invalid.moveIntoTask', 'A task cannot be moved under another task'),
  subtaskParentLocked: () =>
    localize('cliApproval.invalid.subtaskParentLocked', 'A subtask cannot be moved out of its parent task'),
};

function positionError(
  data: ITaskModelData,
  position: CliItemPosition,
  subject: PlacementSubject,
  mode: PlacementMode
): string | null {
  const code = checkPlacement(data, subject, position, mode);
  return code ? PLACEMENT_MESSAGES[code]() : null;
}

/** where a position points to, as a renderable path + sibling anchor */
function positionLocation(
  data: ITaskModelData,
  position: CliItemPosition,
  itemType: TaskObjectSchema['type']
): CliApprovalLocationView {
  const parent = positionParent(data, position);
  const reference = positionReference(data, position);
  let anchor: CliApprovalLocationView['anchor'] = null;
  if (position.type === 'firstElement') {
    anchor = { relation: 'first' };
  } else if (reference) {
    anchor = { relation: position.type === 'afterElement' ? 'after' : 'before', item: entityRef(reference) };
  }
  return { path: containerPath(data, parent), root: rootFor(itemType), rootLabel: rootLabelFor(itemType), anchor };
}

/** the containers an existing item currently lives in */
function currentLocation(data: ITaskModelData, item: TaskObjectSchema): CliApprovalLocationView {
  const parentId: string | undefined = (item as { parentId?: string }).parentId;
  const parent = parentId ? data.taskObjectMap.get(parentId) : undefined;
  return {
    path: containerPath(data, parent),
    root: rootFor(item.type),
    rootLabel: rootLabelFor(item.type),
    anchor: null,
  };
}

/** id is attached by `analyzeRequest`, which is the one that sees the op */
function baseOp(
  partial: Pick<CliApprovalOpView, 'type' | 'kind' | 'action'> & Partial<CliApprovalOpView>
): Omit<CliApprovalOpView, 'id'> {
  return {
    entity: null,
    unresolvedUid: null,
    changes: [],
    location: null,
    move: null,
    tree: null,
    invalidReason: null,
    scope: null,
    ...partial,
  };
}

function analyzeUpdate(
  data: ITaskModelData,
  op:
    | Extract<CliChangeOp, { type: 'update-task' }>
    | Extract<CliChangeOp, { type: 'update-heading' }>
    | Extract<CliChangeOp, { type: 'update-project' }>
    | Extract<CliChangeOp, { type: 'update-area' }>
): Omit<CliApprovalOpView, 'id'> {
  const expectedType = {
    'update-task': 'task',
    'update-heading': 'projectHeading',
    'update-project': 'project',
    'update-area': 'area',
  }[op.type] as TaskObjectSchema['type'];
  const item = findByUid(data, op.uid);
  if (!item || item.type !== expectedType) {
    return baseOp({
      type: op.type,
      kind: 'update',
      action: ACTION_LABELS.update(),
      unresolvedUid: op.uid,
      invalidReason: localize('cliApproval.invalid.itemMissing', 'Item no longer exists'),
    });
  }
  const changes = updateChanges(op.payload, item);
  const isMoveOnly = op.payload.position !== undefined && changes.length === 0;
  const kind = isMoveOnly ? ('move' as const) : ('update' as const);
  const action = isMoveOnly ? ACTION_LABELS.move() : ACTION_LABELS.update();
  if (changes.length === 0 && op.payload.position === undefined) {
    return baseOp({
      type: op.type,
      kind,
      action,
      entity: entityRef(item),
      invalidReason: localize('cliApproval.invalid.noChange', 'Item already has these values'),
      scope: resolveScope(data, item),
    });
  }
  if (op.payload.position) {
    const error = positionError(
      data,
      op.payload.position,
      { type: expectedType, uid: item.uid, hasChildren: ((item as { children?: string[] }).children ?? []).length > 0 },
      'move'
    );
    if (error) {
      return baseOp({ type: op.type, kind, action, entity: entityRef(item), invalidReason: error });
    }
  }
  return baseOp({
    type: op.type,
    kind,
    action,
    entity: entityRef(item),
    changes,
    move: op.payload.position
      ? { from: currentLocation(data, item), to: positionLocation(data, op.payload.position, expectedType) }
      : null,
    scope: resolveScope(data, item),
  });
}

function createItemObjectType(item: CliCreateItem): TaskObjectSchema['type'] {
  switch (item.type) {
    case 'task':
      return 'task';
    case 'heading':
      return 'projectHeading';
    case 'project':
      return 'project';
  }
}

function createItemsAction(items: CliCreateItem[]): string {
  if (items.length === 1) {
    switch (items[0].type) {
      case 'task':
        return ACTION_LABELS.createTask();
      case 'heading':
        return ACTION_LABELS.createHeading();
      case 'project':
        return ACTION_LABELS.createProject();
    }
  }
  const uniform = items.every((item) => item.type === items[0].type) ? items[0].type : null;
  switch (uniform) {
    case 'task':
      return localize('cliApproval.op.createTasks', 'Create {0} tasks', items.length);
    case 'heading':
      return localize('cliApproval.op.createHeadings', 'Create {0} headings', items.length);
    case 'project':
      return localize('cliApproval.op.createProjects', 'Create {0} projects', items.length);
    default:
      return localize('cliApproval.op.createItems', 'Create {0} items', items.length);
  }
}

function analyzeOp(data: ITaskModelData, op: CliChangeOp): Omit<CliApprovalOpView, 'id'> {
  switch (op.type) {
    case 'create-task': {
      const entity: CliApprovalEntityRef = { type: 'task', title: op.title, uid: null };
      const position = op.position ?? { type: 'firstElement' as const };
      const error = positionError(data, position, { type: 'task' }, 'create');
      if (error) {
        return baseOp({
          type: op.type,
          kind: 'create',
          action: ACTION_LABELS.createTask(),
          entity,
          invalidReason: error,
        });
      }
      const parent = positionParent(data, position);
      return baseOp({
        type: op.type,
        kind: 'create',
        action: ACTION_LABELS.createTask(),
        entity,
        changes: createChanges(op),
        location: positionLocation(data, position, 'task'),
        scope: parent ? resolveScope(data, parent) : null,
      });
    }
    case 'create-project': {
      const entity: CliApprovalEntityRef = { type: 'project', title: op.title, uid: null };
      if (!op.parentUid) {
        return baseOp({
          type: op.type,
          kind: 'create',
          action: ACTION_LABELS.createProject(),
          entity,
          location: { path: [], root: 'root', rootLabel: rootLabel(), anchor: null },
        });
      }
      const parent = findByUid(data, op.parentUid);
      if (!parent || parent.type !== 'area') {
        return baseOp({
          type: op.type,
          kind: 'create',
          action: ACTION_LABELS.createProject(),
          entity,
          invalidReason: localize('cliApproval.invalid.parentMissing', 'Parent no longer exists'),
        });
      }
      return baseOp({
        type: op.type,
        kind: 'create',
        action: ACTION_LABELS.createProject(),
        entity,
        location: { path: containerPath(data, parent), root: 'root', rootLabel: rootLabel(), anchor: null },
        scope: resolveScope(data, parent),
      });
    }
    case 'create-heading': {
      const entity: CliApprovalEntityRef = { type: 'projectHeading', title: op.title, uid: null };
      const error = positionError(data, op.position, { type: 'projectHeading' }, 'create');
      if (error) {
        return baseOp({
          type: op.type,
          kind: 'create',
          action: ACTION_LABELS.createHeading(),
          entity,
          invalidReason: error,
        });
      }
      const parent = positionParent(data, op.position);
      return baseOp({
        type: op.type,
        kind: 'create',
        action: ACTION_LABELS.createHeading(),
        entity,
        location: positionLocation(data, op.position, 'projectHeading'),
        scope: parent ? resolveScope(data, parent) : null,
      });
    }
    case 'create-area':
      return baseOp({
        type: op.type,
        kind: 'create',
        action: ACTION_LABELS.createArea(),
        entity: { type: 'area', title: op.title, uid: null },
      });
    case 'update-task':
    case 'update-heading':
    case 'update-project':
    case 'update-area':
      return analyzeUpdate(data, op);
    case 'delete-task':
    case 'delete-area': {
      const expectedType = op.type === 'delete-task' ? 'task' : 'area';
      const item = findByUid(data, op.uid);
      if (!item || item.type !== expectedType) {
        return baseOp({
          type: op.type,
          kind: 'delete',
          action: ACTION_LABELS.delete(),
          unresolvedUid: op.uid,
          invalidReason: localize('cliApproval.invalid.itemMissing', 'Item no longer exists'),
        });
      }
      return baseOp({
        type: op.type,
        kind: 'delete',
        action: ACTION_LABELS.delete(),
        entity: entityRef(item),
        location: currentLocation(data, item),
        scope: resolveDeletionScope(data, item),
      });
    }
    case 'create-items': {
      const action = createItemsAction(op.items);
      // a single top-level item reads like a plain create: the item becomes the
      // sentence object and only its children go into the subtree block
      const single = op.items.length === 1 ? op.items[0] : null;
      const entity: CliApprovalEntityRef | null = single
        ? { type: createItemObjectType(single), title: single.title, uid: null }
        : null;
      const changes = single && single.type !== 'heading' ? createChanges(single) : [];
      const treeItems = single ? (single.children ?? []) : op.items;
      const nestingIsValid = op.items.every(createItemHasValidTaskNesting);
      const tree = nestingIsValid && treeItems.length > 0 ? treeItems.map(treeNode) : null;
      const position = op.position ?? { type: 'firstElement' as const };
      if (!nestingIsValid) {
        return baseOp({
          type: op.type,
          kind: 'create',
          action,
          entity,
          changes,
          tree,
          invalidReason: PLACEMENT_MESSAGES.nestingTooDeep(),
        });
      }
      for (const item of op.items) {
        const error = positionError(
          data,
          position,
          { type: createItemObjectType(item), hasChildren: (item.children ?? []).length > 0 },
          'create'
        );
        if (error) {
          return baseOp({ type: op.type, kind: 'create', action, entity, changes, tree, invalidReason: error });
        }
      }
      const parent = positionParent(data, position);
      const rootType = op.items.every((item) => item.type === 'task') ? ('task' as const) : ('project' as const);
      return baseOp({
        type: op.type,
        kind: 'create',
        action,
        entity,
        changes,
        tree,
        location: positionLocation(data, position, rootType),
        scope: parent ? resolveScope(data, parent) : null,
      });
    }
  }
}

/** one approval entry shown in the UI: a single op of a pending request */
export interface CliApprovalOpEntry {
  explanation?: CliExplanation;
  requestId: string;
  opId: string;
  createdAt: number;
  op: CliApprovalOpView;
}

export function flattenRequestOps(requests: CliApprovalRequestView[]): CliApprovalOpEntry[] {
  return requests.flatMap((request) =>
    request.ops.map((op) => ({
      explanation: request.explanation,
      requestId: request.requestId,
      opId: op.id,
      createdAt: request.createdAt,
      op,
    }))
  );
}

export function analyzeRequest(data: ITaskModelData, request: CliChangeRequest): CliApprovalRequestView {
  // `id` is stamped by the pending queue; the index fallback only covers the
  // ui-test injection path, which never mutates its queue
  const ops: CliApprovalOpView[] = request.ops.map((op, index) => ({
    ...analyzeOp(data, op),
    id: op.id ?? String(index),
  }));
  const scopes: CliApprovalScope[] = [];
  for (const op of ops) {
    if (op.scope && !scopes.some((scope) => scope.uid === op.scope!.uid)) {
      scopes.push(op.scope);
    }
  }
  return {
    explanation: request.explanation,
    requestId: request.requestId,
    createdAt: request.createdAt,
    databaseId: request.databaseId,
    ops,
    invalid: ops.some((op) => op.invalidReason !== null),
    scopes,
  };
}

// --- apply ---

/**
 * The mutation surface needed to apply a change request. Both `TaskModel`
 * and `ITodoService` satisfy it structurally.
 */
export interface CliApprovalApplyTarget {
  runInTransaction<T>(callback: () => T): T;
  addTask(task: CreateTaskSchema): TreeID;
  addProject(project: CreateProjectSchema): TreeID;
  addProjectHeading(heading: CreateProjectHeadingSchema): TreeID;
  addArea(area: CreateAreaSchema): TreeID;
  updateTask(taskId: TreeID, payload: UpdateTaskSchema): void;
  updateProject(projectId: TreeID, payload: UpdateProjectSchema): void;
  updateProjectHeading(headingId: TreeID, payload: UpdateProjectHeadingSchema): void;
  updateArea(areaId: TreeID, payload: UpdateAreaSchema): void;
  deleteItem(itemId: string): void;
}

/** append inside a container (or at the root when container is undefined) */
function appendPosition(container: TaskObjectSchema | undefined): ItemPosition | undefined {
  if (!container) {
    return undefined;
  }
  const children = (container as { children?: string[] }).children ?? [];
  if (children.length === 0) {
    return { type: 'firstElement', parentId: container.id };
  }
  return { type: 'afterElement', previousElementId: children[children.length - 1] as TreeID };
}

function requireUid(data: ITaskModelData, uid: string, kind: TaskObjectSchema['type']): TaskObjectSchema {
  const item = data.taskObjectUidMap.get(uid);
  if (!item) {
    throw new Error(`"${uid}" not found`);
  }
  if (item.type !== kind) {
    throw new Error(`"${uid}" is not a ${kind}`);
  }
  return item;
}

function requireAnyUid(data: ITaskModelData, uid: string): TaskObjectSchema {
  const item = data.taskObjectUidMap.get(uid);
  if (!item) {
    throw new Error(`"${uid}" not found`);
  }
  return item;
}

/** uid → TreeID only; legality is `requirePlacement`'s job */
function toItemPosition(data: ITaskModelData, position: CliItemPosition): ItemPosition {
  switch (position.type) {
    case 'firstElement':
      return {
        type: 'firstElement',
        parentId: position.parentUid ? requireAnyUid(data, position.parentUid).id : undefined,
      };
    case 'afterElement':
      return {
        type: 'afterElement',
        previousElementId: requireAnyUid(data, position.previousElementUid).id,
      };
    case 'beforeElement':
      return {
        type: 'beforeElement',
        nextElementId: requireAnyUid(data, position.nextElementUid).id,
      };
  }
}

/**
 * The last gate on the write path. `analyzeRequest` runs the same check to
 * mark ops invalid up front, but the model has no nesting protection of its
 * own, so this one must stay even though it looks redundant.
 */
function requirePlacement(
  data: ITaskModelData,
  position: CliItemPosition,
  subject: PlacementSubject,
  mode: PlacementMode
): ItemPosition {
  const code = checkPlacement(data, subject, position, mode);
  if (code) {
    throw new Error(PLACEMENT_MESSAGES[code]());
  }
  return toItemPosition(data, position);
}

function addCreateTask(target: CliApprovalApplyTarget, task: CliCreateTask, position: ItemPosition): TreeID {
  const taskId = target.addTask({
    title: task.title,
    notes: task.notes,
    startDate: task.startDate,
    dueDate: task.dueDate,
    tags: task.tags,
    position,
  });
  let previousId: TreeID | undefined;
  for (const child of task.children ?? []) {
    previousId = addCreateTask(
      target,
      child,
      previousId ? { type: 'afterElement', previousElementId: previousId } : { type: 'firstElement', parentId: taskId }
    );
  }
  return taskId;
}

function addCreateHeading(target: CliApprovalApplyTarget, heading: CliCreateHeading, position: ItemPosition): TreeID {
  const headingId = target.addProjectHeading({ title: heading.title, position });
  let previousId: TreeID | undefined;
  for (const task of heading.children ?? []) {
    previousId = addCreateTask(
      target,
      task,
      previousId
        ? { type: 'afterElement', previousElementId: previousId }
        : { type: 'firstElement', parentId: headingId }
    );
  }
  return headingId;
}

function addCreateProject(target: CliApprovalApplyTarget, project: CliCreateProject, position: ItemPosition): TreeID {
  const projectId = target.addProject({ title: project.title, position });
  const projectPayload: UpdateProjectSchema = {
    notes: project.notes,
    startDate: project.startDate,
    dueDate: project.dueDate,
    tags: project.tags,
  };
  if (Object.values(projectPayload).some((value) => value !== undefined)) {
    target.updateProject(projectId, projectPayload);
  }

  let previousId: TreeID | undefined;
  for (const child of project.children ?? []) {
    const childPosition: ItemPosition = previousId
      ? { type: 'afterElement', previousElementId: previousId }
      : { type: 'firstElement', parentId: projectId };
    previousId =
      child.type === 'heading'
        ? addCreateHeading(target, child, childPosition)
        : addCreateTask(target, child, childPosition);
  }
  return projectId;
}

function addCreateItem(target: CliApprovalApplyTarget, item: CliCreateItem, position: ItemPosition): TreeID {
  switch (item.type) {
    case 'task':
      return addCreateTask(target, item, position);
    case 'heading':
      return addCreateHeading(target, item, position);
    case 'project':
      return addCreateProject(target, item, position);
  }
}

/** placement of an existing item being repositioned */
function movePosition(data: ITaskModelData, position: CliItemPosition, item: TaskObjectSchema): ItemPosition {
  return requirePlacement(
    data,
    position,
    { type: item.type, uid: item.uid, hasChildren: ((item as { children?: string[] }).children ?? []).length > 0 },
    'move'
  );
}

function addCreateItems(
  target: CliApprovalApplyTarget,
  data: ITaskModelData,
  op: Extract<CliChangeOp, { type: 'create-items' }>
): void {
  if (op.items.some((item) => !createItemHasValidTaskNesting(item))) {
    throw new Error(PLACEMENT_MESSAGES.nestingTooDeep());
  }
  // every item lands under the same parent, so validating the declared
  // position once per item covers the ones chained after their sibling too
  const declared = op.position ?? { type: 'firstElement' as const };
  for (const item of op.items) {
    const code = checkPlacement(
      data,
      { type: createItemObjectType(item), hasChildren: (item.children ?? []).length > 0 },
      declared,
      'create'
    );
    if (code) {
      throw new Error(PLACEMENT_MESSAGES[code]());
    }
  }
  let position: ItemPosition = op.position
    ? toItemPosition(data, op.position)
    : { type: 'firstElement', parentId: undefined };
  for (const item of op.items) {
    const itemId = addCreateItem(target, item, position);
    position = { type: 'afterElement', previousElementId: itemId };
  }
}

/**
 * Apply a single approved op. Throws when a target has vanished — callers
 * re-validate first (via `analyzeRequest`) and surface the error.
 */
export function applyChangeOp(target: CliApprovalApplyTarget, data: ITaskModelData, op: CliChangeOp): void {
  switch (op.type) {
    case 'create-task':
      target.addTask({
        title: op.title,
        notes: op.notes,
        startDate: op.startDate,
        dueDate: op.dueDate,
        tags: op.tags,
        position: op.position ? requirePlacement(data, op.position, { type: 'task' }, 'create') : undefined,
      });
      break;
    case 'create-project': {
      const parent = op.parentUid ? requireUid(data, op.parentUid, 'area') : undefined;
      target.addProject({ title: op.title, position: appendPosition(parent) });
      break;
    }
    case 'create-heading':
      target.addProjectHeading({
        title: op.title,
        position: requirePlacement(data, op.position, { type: 'projectHeading' }, 'create'),
      });
      break;
    case 'create-area':
      target.addArea({ title: op.title });
      break;
    case 'update-task': {
      const item = requireUid(data, op.uid, 'task');
      const { position, ...payload } = op.payload;
      target.updateTask(item.id, {
        ...payload,
        position: position ? movePosition(data, position, item) : undefined,
      });
      break;
    }
    case 'update-heading': {
      const item = requireUid(data, op.uid, 'projectHeading');
      const { position, ...payload } = op.payload;
      target.updateProjectHeading(item.id, {
        ...payload,
        position: position ? movePosition(data, position, item) : undefined,
      });
      break;
    }
    case 'update-project': {
      const item = requireUid(data, op.uid, 'project');
      const { position, ...payload } = op.payload;
      target.updateProject(item.id, {
        ...payload,
        position: position ? movePosition(data, position, item) : undefined,
      });
      break;
    }
    case 'update-area': {
      const item = requireUid(data, op.uid, 'area');
      const { position, ...payload } = op.payload;
      target.updateArea(item.id, {
        ...payload,
        position: position ? movePosition(data, position, item) : undefined,
      });
      break;
    }
    case 'delete-task':
      target.deleteItem(requireUid(data, op.uid, 'task').id);
      break;
    case 'delete-area':
      target.deleteItem(requireUid(data, op.uid, 'area').id);
      break;
    case 'create-items':
      target.runInTransaction(() => {
        addCreateItems(target, data, op);
      });
      break;
  }
}

/** apply every op of an approved request, in order */
export function applyChangeRequest(
  target: CliApprovalApplyTarget,
  data: ITaskModelData,
  request: CliChangeRequest
): void {
  for (const op of request.ops) {
    applyChangeOp(target, data, op);
  }
}
