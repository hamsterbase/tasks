import { FilterOption, isTaskVisible } from '@/core/time/filterProjectAndTask';
import { TreeID } from 'loro-crdt';
import { getProject } from '../getProject';
import { getTaskInfo } from '../getTaskInfo';
import type { TagFilter } from '../getProjectHeadingAndTasks';
import { ITaskModelData, ProjectInfoState, TaskInfo } from '../type';

export interface TodayItemsResult {
  willDisappearObjectIdSet: Set<TreeID>;
  items: (TaskInfo | ProjectInfoState)[];
  dueDateItemsCount: number;
  startDateItemsCount: number;
  /**
   * Today 视图中所有任务用到的标签集合（在按标签过滤前）
   */
  allTags: string[];
}

/**
 * Get tasks and projects for today's view with count information
 * @param modelData
 * @param today
 */
export function getTodayItems(
  modelData: ITaskModelData,
  today: number,
  filterOption?: FilterOption,
  tagsFilter: TagFilter = { type: 'all' }
): TodayItemsResult {
  const willDisappearObjectIdSet = new Set<TreeID>();
  const dateAssignedList = modelData.dateAssignedList;
  const items: (TaskInfo | ProjectInfoState)[] = [];
  const allTagsSet = new Set<string>();
  let dueDateItemsCount = 0;
  let startDateItemsCount = 0;

  const isEntityMatchedByTags = (entity: { tags?: string[] }): boolean => {
    if (tagsFilter.type === 'all') {
      return true;
    }
    if (tagsFilter.type === 'untagged') {
      return !entity.tags || entity.tags.length === 0;
    }
    return !!entity.tags?.includes(tagsFilter.value);
  };

  dateAssignedList.forEach((item) => {
    const type = modelData.taskObjectMap.get(item)?.type;
    if (type === 'task') {
      const task = getTaskInfo(modelData, item);
      const isCandidate = (task.dueDate && task.dueDate <= today) || (task.startDate && task.startDate <= today);
      if (!isCandidate) {
        return;
      }
      const taskState = isTaskVisible(task, filterOption);
      if (taskState === 'invalid') {
        return;
      }
      task.tags?.forEach((tag) => allTagsSet.add(tag));
      if (!isEntityMatchedByTags(task) && taskState !== 'recentChanged') {
        return;
      }
      if (taskState === 'recentChanged') {
        willDisappearObjectIdSet.add(task.id);
      }
      items.push(task);
      if (task.status === 'created') {
        if (task.dueDate && task.dueDate <= today) {
          dueDateItemsCount++;
        } else {
          startDateItemsCount++;
        }
      }
    }
    if (type === 'project') {
      const project = getProject(modelData, item);
      const isCandidate =
        (project.dueDate && project.dueDate <= today) || (project.startDate && project.startDate <= today);
      if (!isCandidate) {
        return;
      }
      const projectState = isTaskVisible(project, filterOption);
      if (projectState === 'invalid') {
        return;
      }
      project.tags?.forEach((tag) => allTagsSet.add(tag));
      if (!isEntityMatchedByTags(project) && projectState !== 'recentChanged') {
        return;
      }
      if (projectState === 'recentChanged') {
        willDisappearObjectIdSet.add(project.id);
      }
      items.push(project);
      if (project.status === 'created') {
        if (project.dueDate && project.dueDate <= today) {
          dueDateItemsCount++;
        } else {
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
    allTags: Array.from(allTagsSet).sort(),
  };
}
