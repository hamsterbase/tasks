import { LoroMovableList, TreeID } from 'loro-crdt';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EmptyObject = {};

export type ToLoro<T, Patch = EmptyObject> = Omit<
  {
    [K in keyof T]: T[K] extends (infer U)[] ? LoroMovableList<U> : T[K];
  },
  keyof Patch
> &
  Patch;

export type AreaSchema = {
  id: TreeID;
  uid: string;
  type: 'area';
  title: string;
  createdAt: number;
  children: TreeID[];
  tags: string[];
};

export type ItemPosition =
  | {
      type: 'firstElement';
      //如果是 undefined, 则表示是根节点
      parentId?: TreeID;
    }
  | ItemMovePosition;

export type ItemMovePosition =
  | {
      type: 'afterElement';
      previousElementId: TreeID;
    }
  | {
      type: 'beforeElement';
      nextElementId: TreeID;
    };

export type UpdateAreaSchema = {
  title?: string;
  position?: ItemPosition;
  tags?: string[];
};

export type CreateAreaSchema = {
  title: string;
  position?: ItemPosition;
};

export type ProjectSchema = {
  id: TreeID;
  uid: string;
  type: 'project';
  title: string;
  notes?: string;
  /**
   * 1. 如果 parentId 为空，则表示项目是根项目
   * 2. 如果 parentId 不为空，则表示项目是 area 的子项目
   */
  parentId?: TreeID;
  startDate?: number;
  dueDate?: number;
  createdAt: number;
  status: ItemStatus;
  completionAt?: number;
  tags: string[];
  children: TreeID[];
};
export type ProjectLoroSchemaPatch = {
  status: never;
  /**
   * 是 json 字符串
   * { type: 'completed', timestamp: 1717977600000 }
   * { type: 'canceled', timestamp: 1717977600000 }
   */
  completion?: string;
};

export type ProjectLoroSchema = ToLoro<ProjectSchema, ProjectLoroSchemaPatch>;

export type CreateProjectSchema = {
  title: string;
  position?: ItemPosition;
};

export interface UpdateProjectSchema {
  tags?: string[];
  title?: string;
  dueDate?: number | null;
  startDate?: number | null;
  notes?: string;
  position?: ItemPosition;
}

export type ProjectHeadingSchema = {
  id: TreeID;
  uid: string;
  type: 'projectHeading';
  title: string;
  parentId: TreeID;
  children: TreeID[];
  isArchived: boolean;
  archivedDate?: number | null;
};

export type CreateProjectHeadingSchema = {
  title: string;
  position: ItemPosition;
};

export type UpdateProjectHeadingSchema = {
  title?: string;
  position?: ItemPosition;
  archivedDate?: number | null;
};

export type ItemStatus = 'created' | 'completed' | 'canceled';

export type TaskSchema = {
  id: TreeID;
  uid: string;
  type: 'task';
  title: string;
  notes?: string;
  status: ItemStatus;
  /**
   * 1. 如果 parentId 为空，则表示该任务是 inbox 下的任务
   * 2. 如果 parentId 不为空
   *    2.1 如果 parentId 是 project_heading 的 id，则表示该任务是 project_heading 的子任务
   *    2.2 如果 parentId 是 project 的 id，则表示该任务是 project 的子任务
   *    2.3 如果 parentId 是 area 的 id，则表示该任务是 area 的子任务
   *    2.4 如果 parentId 是 task 的 id，则表示该任务是 task 的字任务
   */
  parentId?: string;
  children: string[];
  tags: string[];

  completionAt?: number;

  createdAt: number;
  /**
   * 格式为日期, 一律为 0 时区的 YYYY-MM-DD
   */
  startDate?: number;
  /**
   * 格式为日期, 一律为 0 时区的 YYYY-MM-DD
   */
  dueDate?: number;
};

export type TaskLoroSchemaPatch = {
  status: never;
  /**
   * 是 json 字符串
   * { type: 'completed', timestamp: 1717977600000 }
   * { type: 'canceled', timestamp: 1717977600000 }
   */
  completion?: string;
};

export type TaskLoroSchema = ToLoro<TaskSchema, TaskLoroSchemaPatch>;

export type CreateTaskSchema = {
  title: string;
  notes?: string;
  startDate?: number | null;
  dueDate?: number | null;
  tags?: string[];
  position?: ItemPosition;
};

export type UpdateTaskSchema = {
  status?: ItemStatus;
  title?: string;
  notes?: string;
  startDate?: number | null;
  dueDate?: number | null;
  tags?: string[];
  parentId?: TreeID;
  previousTaskId?: TreeID | null;
  position?: ItemPosition;
  completionAt?: number;
};

export type TaskObjectSchema = AreaSchema | ProjectSchema | ProjectHeadingSchema | TaskSchema;

export type TaskObjectType = TaskObjectSchema['type'];

export interface ITaskModelData {
  version: Record<string, number>;
  taskList: TaskObjectSchema[];
  taskObjectMap: Map<string, TaskObjectSchema>;
  taskObjectUidMap: Map<string, TaskObjectSchema>;
  rootObjectIdList: TreeID[];
  dateAssignedList: TreeID[];
  remindersMap: Map<TreeID, ReminderWithId[]>;
}

export interface ProjectStatusTransition {
  projectId: TreeID;
  projectStatus: ItemStatus;
  taskStatus?: ItemStatus;
  completionAt?: number;
}

export type ReminderSchema = {
  itemId: TreeID;
  time: number;
};

export type CreateReminderSchema = {
  itemId: TreeID;
  time: number;
};

export type UpdateReminderSchema = {
  time: number;
};

export type ReminderWithId = {
  reminderId: string;
  itemId: TreeID;
  time: number;
};
