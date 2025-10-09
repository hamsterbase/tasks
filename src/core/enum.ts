export const ModelKeys = {
  type: 'type',
  title: 'title',
  uid: 'uid',
  notes: 'notes',
  createdAt: 'createdAt',
  tags: 'tags',
  children: 'children',
  startDate: 'startDate',
  dueDate: 'dueDate',
  parentId: 'parentId',
  completion: 'completion',
  status: 'status',
  archivedDate: 'archivedDate',
} as const;

export const ModelTypes = {
  // 虚拟节点
  root: 'root',
  area: 'area',
  project: 'project',
  projectHeading: 'projectHeading',
  task: 'task',
} as const;

export const TaskModelListKeys = {
  objects: 'objects',
  inboxTasks: 'inboxTasks',
  rootCollections: 'rootCollections',
} as const;

export const ItemStatusEnum = {
  created: 'created',
  completed: 'completed',
  canceled: 'canceled',
} as const;
