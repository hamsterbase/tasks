import { BatchEditParams, BatchEditResult } from '@/core/state/tasks/batchEdit/batchEdit';
import { CreateProjectWithChildrenParams } from '@/core/state/tasks/createProject/types';
import {
  CreateAreaSchema,
  CreateProjectHeadingSchema,
  CreateProjectSchema,
  CreateReminderSchema,
  CreateTaskSchema,
  ITaskModelData,
  ItemMovePosition,
  ProjectStatusTransition,
  ReminderWithId,
  UpdateAreaSchema,
  UpdateProjectHeadingSchema,
  UpdateProjectSchema,
  UpdateReminderSchema,
  UpdateTaskSchema,
} from '@/core/type.ts';
import { IDatabaseStorage } from '@/services/database/common/database';
import type { TreeID } from 'loro-crdt';
import { Event } from 'vs/base/common/event.ts';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation.ts';

export interface EditingContent {
  id: TreeID;
}

export type TaskCommand =
  | {
      type: 'createTask';
      title?: string;
      disableAutoFocus?: boolean;
    }
  | {
      type: 'createProject';
    }
  | {
      type: 'createHeader';
    }
  | {
      type: 'setStartDateToToday';
    };

export interface ITodoService {
  storageId: string;
  readonly _serviceBrand: undefined;

  onStateChange: Event<void>;
  onEditingContentChange: Event<TreeID>;

  initStorage(storage: IDatabaseStorage, keepPeerId: boolean): Promise<void>;

  editingContent: EditingContent | null;

  keepAliveElements: string[];

  endEditingContent(): void;

  modelState: ITaskModelData;

  getModelVersion(databaseId: string): Record<string, number>;
  import(data: Array<Uint8Array>, databaseId: string): Promise<void>;
  exportPatch(from: Record<string, number>, databaseId: string): Uint8Array;

  moveDateAssignedList(item: TreeID, position: ItemMovePosition): void;

  addArea(area: CreateAreaSchema): TreeID;
  addProject(project: CreateProjectSchema): TreeID;
  addProjectHeading(projectHeading: CreateProjectHeadingSchema): TreeID;
  addTask(task: CreateTaskSchema): TreeID;

  updateArea(areaId: TreeID, payload: UpdateAreaSchema): void;
  updateProject(projectId: TreeID, payload: UpdateProjectSchema): void;
  transitionProjectState(options: ProjectStatusTransition): void;
  updateProjectHeading(projectHeadingId: TreeID, payload: UpdateProjectHeadingSchema): void;
  updateTask(taskId: TreeID, payload: UpdateTaskSchema): void;

  editItem(itemId: TreeID): void;
  deleteItem(itemId: string): void;
  covertToProject(itemId: TreeID): void;

  addReminder(data: CreateReminderSchema): string;
  updateReminder(reminderId: string, data: UpdateReminderSchema): void;
  deleteReminder(reminderId: string): void;
  getReminders(): Map<TreeID, ReminderWithId[]>;

  onTaskCommands: Event<TaskCommand>;

  fireTaskCommand(command: TaskCommand): void;

  undo(): void;
  redo(): void;

  clearUndoHistory(): void;

  /**
   * 创建带子项的 project
   * @param params 创建参数
   * @returns 创建的 project ID
   */
  createProjectWithChildren(params: CreateProjectWithChildrenParams): TreeID;

  /**
   * 批量编辑操作
   * @param params 批量编辑参数
   * @returns 执行结果
   */
  batchEdit(params: BatchEditParams): BatchEditResult;
}

export const ITodoService = createDecorator<ITodoService>('todoService');
