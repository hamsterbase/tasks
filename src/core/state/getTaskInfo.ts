import { ITaskModelData, TaskSchema } from '@/core/type.ts';
import type { TreeID } from 'loro-crdt';
import { TaskInfo } from './type';

export function getTaskInfo(modelData: ITaskModelData, taskId: TreeID): TaskInfo {
  const o = modelData.taskObjectMap.get(taskId);
  if (!o) {
    throw new Error('task not found');
  }
  if (o.type !== 'task') {
    throw new Error(`invalid task id: ${taskId}, type: ${o.type}`);
  }

  const isSubTask = !!o.parentId && modelData.taskObjectMap.get(o.parentId)?.type === 'task';

  let projectTitle = '';
  let isParentArchived = false;
  if (o.parentId) {
    const parentNode = modelData.taskObjectMap.get(o.parentId);
    if (parentNode?.type === 'project') {
      projectTitle = parentNode.title;
    } else if (parentNode?.type === 'projectHeading') {
      projectTitle = modelData.taskObjectMap.get(parentNode.parentId)?.title ?? '';
      isParentArchived = parentNode.isArchived;
    }
  }

  return {
    type: 'task',
    id: o.id,
    uid: o.uid,
    title: o.title,
    notes: o.notes,
    tags: o.tags,
    startDate: o.startDate,
    dueDate: o.dueDate,
    status: o.status,
    parentId: o.parentId,
    isParentArchived,
    projectTitle,
    completionAt: o.completionAt,
    isSubTask,
    reminders: modelData.remindersMap.get(taskId) || [],
    recurringRule: o.recurringRule,
    children: o.children.map((child) => {
      const childTask = modelData.taskObjectMap.get(child) as TaskSchema;
      return {
        id: childTask.id,
        title: childTask.title,
        status: childTask.status,
      };
    }),
  };
}

export function getTaskInfoList(modelData: ITaskModelData, taskIdList: TreeID[]): TaskInfo[] {
  return taskIdList
    .map((taskId) => {
      const o = modelData.taskObjectMap.get(taskId);
      if (!o) {
        return null;
      }
      if (o.type !== 'task') {
        return null;
      }
      return getTaskInfo(modelData, taskId);
    })
    .filter((task) => task !== null);
}
