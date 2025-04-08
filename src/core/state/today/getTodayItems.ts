import { FilterOption, isTaskVisible } from '@/core/time/filterProjectAndTask';
import { TreeID } from 'loro-crdt';
import { getProject } from '../getProject';
import { getTaskInfo } from '../getTaskInfo';
import { ITaskModelData, ProjectInfoState, TaskInfo } from '../type';

export interface TodayItemsResult {
  willDisappearObjectIdSet: Set<TreeID>;
  items: (TaskInfo | ProjectInfoState)[];
  dueDateItemsCount: number;
  startDateItemsCount: number;
}

/**
 * Get tasks and projects for today's view with count information
 * @param modelData
 * @param today
 */
export function getTodayItems(modelData: ITaskModelData, today: number, filterOption?: FilterOption): TodayItemsResult {
  const willDisappearObjectIdSet = new Set<TreeID>();
  const dateAssignedList = modelData.dateAssignedList;
  const items: (TaskInfo | ProjectInfoState)[] = [];
  let dueDateItemsCount = 0;
  let startDateItemsCount = 0;

  dateAssignedList.forEach((item) => {
    const type = modelData.taskObjectMap.get(item)?.type;
    if (type === 'task') {
      const task = getTaskInfo(modelData, item);
      if (task.dueDate && task.dueDate <= today) {
        if (isTaskVisible(task, filterOption) === 'invalid') {
          return;
        }
        if (isTaskVisible(task, filterOption) === 'recentChanged') {
          willDisappearObjectIdSet.add(task.id);
        }
        items.push(task);
        if (task.status === 'created') {
          dueDateItemsCount++;
        }
      } else if (task.startDate && task.startDate <= today) {
        if (isTaskVisible(task, filterOption) === 'invalid') {
          return;
        }
        if (isTaskVisible(task, filterOption) === 'recentChanged') {
          willDisappearObjectIdSet.add(task.id);
        }
        items.push(task);
        if (task.status === 'created') {
          startDateItemsCount++;
        }
      }
    }
    if (type === 'project') {
      const project = getProject(modelData, item);
      if (project.dueDate && project.dueDate <= today) {
        if (isTaskVisible(project, filterOption) === 'invalid') {
          return;
        }
        if (isTaskVisible(project, filterOption) === 'recentChanged') {
          willDisappearObjectIdSet.add(project.id);
        }
        items.push(project);
        if (project.status === 'created') {
          dueDateItemsCount++;
        }
      } else if (project.startDate && project.startDate <= today) {
        if (isTaskVisible(project, filterOption) === 'invalid') {
          return;
        }
        if (isTaskVisible(project, filterOption) === 'recentChanged') {
          willDisappearObjectIdSet.add(project.id);
        }
        items.push(project);
        if (project.status === 'created') {
          startDateItemsCount++;
        }
      }
    }
  });

  return {
    willDisappearObjectIdSet,
    items,
    dueDateItemsCount,
    startDateItemsCount,
  };
}
