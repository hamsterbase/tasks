import type { TreeID } from 'loro-crdt';
import { ItemStatus, TaskObjectSchema } from '../type.ts';

export interface ProjectInfoState {
  type: 'project';
  id: TreeID;
  uid: string;
  notes?: string;
  title: string;
  tags: string[];
  startDate?: number;
  dueDate?: number;
  status: ItemStatus;
  completionAt?: number;
  progress: number;
  projectHeadings: ProjectHeadingInfo[];
  tasks: TaskInfo[];
  totalTasks: number;
  completedTasks: number;
  areaTitle?: string;
}

export interface AreaInfoState {
  id: TreeID;
  uid: string;
  title: string;
  tags: string[];
  projectList: ProjectInfoState[];
}

export interface AreaDetailState {
  id: TreeID;
  uid: string;
  title: string;
  tags: string[];
  projectList: ProjectInfoState[];
  taskList: TaskInfo[];
}

export interface SubTaskInfo {
  id: TreeID;
  title: string;
  status: ItemStatus;
}

export interface TaskInfo {
  type: 'task';
  id: TreeID;
  uid: string;
  title: string;
  notes?: string;
  startDate?: number;
  dueDate?: number;
  tags: string[];
  status: ItemStatus;
  children: SubTaskInfo[];
  parentId?: string;
  isSubTask: boolean;
  projectTitle: string;
  completionAt?: number;
}

export interface ProjectHeadingInfo {
  id: TreeID;
  parentId: TreeID;
  title: string;
  tasks: TaskInfo[];
}

export interface ITaskModelData {
  version: Record<string, number>;
  taskList: TaskObjectSchema[];
  taskObjectMap: Map<string, TaskObjectSchema>;
  taskObjectUidMap: Map<string, TaskObjectSchema>;
  rootObjectIdList: TreeID[];
  dateAssignedList: TreeID[];
}

export function isTask(modelData: ITaskModelData, id: TreeID) {
  return modelData.taskObjectMap.get(id)?.type === 'task';
}

export function isProject(modelData: ITaskModelData, id: TreeID) {
  return modelData.taskObjectMap.get(id)?.type === 'project';
}
