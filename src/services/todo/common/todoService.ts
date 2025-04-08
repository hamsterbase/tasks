import { ITaskModelData } from '@/core/state/type.ts';
import {
  CreateAreaSchema,
  CreateProjectHeadingSchema,
  CreateProjectSchema,
  CreateTaskSchema,
  ItemMovePosition,
  ProjectStatusTransition,
  UpdateAreaSchema,
  UpdateProjectHeadingSchema,
  UpdateProjectSchema,
  UpdateTaskSchema,
} from '@/core/type.ts';
import type { TreeID } from 'loro-crdt';
import { Event } from 'vs/base/common/event.ts';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation.ts';
import { IDatabaseStorage } from '@/services/database/common/database';

export interface EditingContent {
  id: TreeID;
}

export interface ITodoService {
  storageId: string;
  readonly _serviceBrand: undefined;

  onStateChange: Event<void>;
  onEditingContentChange: Event<TreeID>;

  initStorage(storage: IDatabaseStorage): Promise<void>;

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
}

export const ITodoService = createDecorator<ITodoService>('todoService');
