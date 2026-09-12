import type { AttachmentInfo } from './attachments';
import { getTodayTimestampInUtc } from '../../base/common/getTodayTimestampInUtc';
import {
  AreaSchema,
  ITaskModelData,
  ItemStatus,
  ProjectHeadingSchema,
  ProjectSchema,
  TaskObjectSchema,
  TaskSchema,
} from '../../core/type';

export interface VisibilityOptions {
  showFuture: boolean;
  showCompleted: boolean;
}

export interface CliListItem {
  id: string;
  type: 'area' | 'project' | 'task';
  title: string;
  parent: string;
  status?: ItemStatus;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  isOverdue?: boolean;
}

export interface ProjectTreeNode {
  id: string;
  type: 'heading' | 'task';
  title: string;
  status?: ItemStatus;
  startDate?: string;
  dueDate?: string;
  tags?: string[];
  children: ProjectTreeNode[];
}

export interface ProjectView {
  id: string;
  type: 'project';
  title: string;
  notes?: string;
  attachments: AttachmentInfo[];
  status: ItemStatus;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  area?: string;
  children: ProjectTreeNode[];
}

export interface TaskDetail {
  id: string;
  type: 'task';
  title: string;
  notes?: string;
  attachments: AttachmentInfo[];
  status: ItemStatus;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  location: string;
  parentId?: string;
  children: TaskDetail[];
}

export interface HeadingView {
  id: string;
  type: 'heading';
  title: string;
  isArchived: boolean;
  location: string;
  parentId?: string;
  children: ProjectTreeNode[];
}

export interface AreaProjectSummary {
  id: string;
  type: 'project';
  title: string;
  status: ItemStatus;
  startDate?: string;
  dueDate?: string;
  tags: string[];
}

export interface AreaView {
  id: string;
  type: 'area';
  title: string;
  tags: string[];
  children: AreaProjectSummary[];
}

/** Whatever an id turns out to name. The `type` field tells the caller which one it got. */
export type InspectView = TaskDetail | ProjectView | HeadingView | AreaView;

export function formatDate(timestamp: number | undefined): string | undefined {
  if (timestamp === undefined) {
    return undefined;
  }
  const date = new Date(timestamp);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

function isVisible(
  item: Pick<TaskSchema | ProjectSchema, 'status' | 'startDate'>,
  options: VisibilityOptions,
  today = getTodayTimestampInUtc()
): boolean {
  if (!options.showCompleted && item.status !== 'created') {
    return false;
  }
  if (!options.showFuture && item.startDate !== undefined && item.startDate > today) {
    return false;
  }
  return true;
}

function parentObject(data: ITaskModelData, item: TaskObjectSchema): TaskObjectSchema | undefined {
  const parentId = 'parentId' in item ? item.parentId : undefined;
  return parentId ? data.taskObjectMap.get(parentId) : undefined;
}

function locationParts(data: ITaskModelData, item: TaskObjectSchema): string[] {
  const parts: string[] = [];
  let current = parentObject(data, item);
  while (current) {
    parts.unshift(current.title);
    current = parentObject(data, current);
  }
  return parts;
}

function location(data: ITaskModelData, item: TaskObjectSchema): string {
  const path = locationParts(data, item).join(' / ');
  return path || (item.type === 'task' ? 'Inbox' : 'Root');
}

function toListItem(data: ITaskModelData, item: TaskSchema | ProjectSchema): CliListItem {
  const today = getTodayTimestampInUtc();
  return {
    id: item.uid,
    type: item.type,
    title: item.title,
    parent: location(data, item),
    status: item.status,
    startDate: formatDate(item.startDate),
    dueDate: formatDate(item.dueDate),
    tags: item.tags,
    isOverdue: item.dueDate !== undefined && item.dueDate < today,
  };
}

export function getShowItems(data: ITaskModelData, options: VisibilityOptions): CliListItem[] {
  const rows: CliListItem[] = [];
  for (const rootId of data.rootObjectIdList) {
    const root = data.taskObjectMap.get(rootId);
    if (!root) {
      continue;
    }
    if (root.type === 'area') {
      rows.push({
        id: root.uid,
        type: 'area',
        title: root.title,
        parent: '',
        tags: root.tags,
      });
      for (const childId of root.children) {
        const child = data.taskObjectMap.get(childId);
        if (child?.type === 'project' && isVisible(child, options)) {
          rows.push(toListItem(data, child));
        }
      }
    } else if (root.type === 'project' && isVisible(root, options)) {
      rows.push(toListItem(data, root));
    }
  }
  return rows;
}

export function getInboxItems(data: ITaskModelData, options: VisibilityOptions): CliListItem[] {
  return data.rootObjectIdList
    .map((id) => data.taskObjectMap.get(id))
    .filter((item): item is TaskSchema => item?.type === 'task')
    .filter((task) => isVisible(task, options))
    .map((task) => toListItem(data, task));
}

function isTodayCandidate(item: TaskSchema | ProjectSchema, options: VisibilityOptions, today: number): boolean {
  if (item.startDate === undefined && item.dueDate === undefined) {
    return false;
  }
  return (
    (item.dueDate !== undefined && item.dueDate <= today) ||
    (item.startDate !== undefined && (options.showFuture || item.startDate <= today))
  );
}

export function getTodayItems(data: ITaskModelData, options: VisibilityOptions): CliListItem[] {
  const today = getTodayTimestampInUtc();
  const rows: CliListItem[] = [];
  for (const id of data.dateAssignedList) {
    const item = data.taskObjectMap.get(id);
    if (
      (item?.type === 'task' || item?.type === 'project') &&
      isVisible(item, options, today) &&
      isTodayCandidate(item, options, today)
    ) {
      rows.push(toListItem(data, item));
    }
  }
  return rows;
}

function taskTree(data: ITaskModelData, task: TaskSchema, options: VisibilityOptions): ProjectTreeNode | null {
  if (!isVisible(task, options)) {
    return null;
  }
  return {
    id: task.uid,
    type: 'task',
    title: task.title,
    status: task.status,
    startDate: formatDate(task.startDate),
    dueDate: formatDate(task.dueDate),
    tags: task.tags,
    children: task.children
      .map((id) => data.taskObjectMap.get(id))
      .filter((item): item is TaskSchema => item?.type === 'task')
      .map((child) => taskTree(data, child, options))
      .filter((child): child is ProjectTreeNode => child !== null),
  };
}

function headingTree(
  data: ITaskModelData,
  heading: ProjectHeadingSchema,
  options: VisibilityOptions
): ProjectTreeNode | null {
  const children = heading.children
    .map((id) => data.taskObjectMap.get(id))
    .filter((item): item is TaskSchema => item?.type === 'task')
    .map((task) => taskTree(data, task, options))
    .filter((task): task is ProjectTreeNode => task !== null);
  if (heading.isArchived && !options.showCompleted && children.length === 0) {
    return null;
  }
  return {
    id: heading.uid,
    type: 'heading',
    title: heading.title,
    children,
  };
}

export function getProjectView(data: ITaskModelData, uid: string, options: VisibilityOptions): ProjectView {
  const item = data.taskObjectUidMap.get(uid);
  if (!item) {
    throw new Error(`project "${uid}" not found`);
  }
  if (item.type !== 'project') {
    throw new Error(`"${uid}" is a ${item.type}, not a project`);
  }
  const parent = parentObject(data, item);
  const children = item.children
    .map((id) => data.taskObjectMap.get(id))
    .map((child) => {
      if (child?.type === 'task') {
        return taskTree(data, child, options);
      }
      if (child?.type === 'projectHeading') {
        return headingTree(data, child, options);
      }
      return null;
    })
    .filter((child): child is ProjectTreeNode => child !== null);
  return {
    id: item.uid,
    type: 'project',
    title: item.title,
    notes: item.notes,
    attachments: [],
    status: item.status,
    startDate: formatDate(item.startDate),
    dueDate: formatDate(item.dueDate),
    tags: item.tags,
    area: parent?.type === 'area' ? parent.title : undefined,
    children,
  };
}

function taskDetail(data: ITaskModelData, task: TaskSchema): TaskDetail {
  const parent = parentObject(data, task);
  return {
    id: task.uid,
    type: 'task',
    title: task.title,
    notes: task.notes,
    attachments: [],
    status: task.status,
    startDate: formatDate(task.startDate),
    dueDate: formatDate(task.dueDate),
    tags: task.tags,
    location: location(data, task),
    parentId: parent?.uid,
    children: task.children
      .map((id) => data.taskObjectMap.get(id))
      .filter((item): item is TaskSchema => item?.type === 'task')
      .map((child) => taskDetail(data, child)),
  };
}

export function getTaskDetails(data: ITaskModelData, uids: string[]): TaskDetail[] {
  return uids.map((uid) => {
    const item = data.taskObjectUidMap.get(uid);
    if (!item) {
      throw new Error(`task "${uid}" not found`);
    }
    if (item.type !== 'task') {
      throw new Error(`"${uid}" is a ${item.type}, not a task`);
    }
    return taskDetail(data, item);
  });
}

function headingView(data: ITaskModelData, heading: ProjectHeadingSchema, options: VisibilityOptions): HeadingView {
  const parent = parentObject(data, heading);
  return {
    id: heading.uid,
    type: 'heading',
    title: heading.title,
    isArchived: heading.isArchived,
    location: location(data, heading),
    parentId: parent?.uid,
    children: heading.children
      .map((id) => data.taskObjectMap.get(id))
      .filter((item): item is TaskSchema => item?.type === 'task')
      .map((task) => taskTree(data, task, options))
      .filter((task): task is ProjectTreeNode => task !== null),
  };
}

function areaView(data: ITaskModelData, area: AreaSchema, options: VisibilityOptions): AreaView {
  return {
    id: area.uid,
    type: 'area',
    title: area.title,
    tags: area.tags,
    children: area.children
      .map((id) => data.taskObjectMap.get(id))
      .filter((item): item is ProjectSchema => item?.type === 'project')
      .filter((project) => isVisible(project, options))
      .map((project) => ({
        id: project.uid,
        type: 'project' as const,
        title: project.title,
        status: project.status,
        startDate: formatDate(project.startDate),
        dueDate: formatDate(project.dueDate),
        tags: project.tags,
      })),
  };
}

/**
 * Resolves an id of any kind. Callers that only have an id — with no idea
 * whether it names a task, project, heading, or area — use this instead of
 * guessing which of the type-specific view commands to reach for.
 */
export function inspectItem(data: ITaskModelData, uid: string, options: VisibilityOptions): InspectView {
  const item = data.taskObjectUidMap.get(uid);
  if (!item) {
    throw new Error(`"${uid}" not found`);
  }
  switch (item.type) {
    case 'task':
      return taskDetail(data, item);
    case 'project':
      return getProjectView(data, uid, options);
    case 'projectHeading':
      return headingView(data, item, options);
    case 'area':
      return areaView(data, item, options);
  }
}

export function inspectItems(data: ITaskModelData, uids: string[], options: VisibilityOptions): InspectView[] {
  return uids.map((uid) => inspectItem(data, uid, options));
}
