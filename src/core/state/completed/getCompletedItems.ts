import { ItemStatusEnum, ModelTypes } from '@/core/enum';
import { TaskObjectSchema } from '@/core/type';
import { localize } from '@/nls';
import { format, isSameWeek, isSameYear } from 'date-fns';
import { getProject } from '../getProject';
import { getTaskInfo } from '../getTaskInfo';
import type { TagFilter } from '../getProjectHeadingAndTasks';
import { ITaskModelData, ProjectInfoState, TaskInfo } from '../type';

export interface GetCompletedItemsProps {
  currentDate: number;
  recentModifiedObjectIds?: string[];
  tags?: TagFilter;
}

export interface GetCompletedItemsRes {
  groups: CompletedTaskGroup[];
  willDisappearObjectIds: string[];
  allTags: string[];
}

interface CompletedTaskGroup {
  label: string;
  tasks: (TaskInfo | ProjectInfoState)[];
}

export function getCompletedItems(modelData: ITaskModelData, options: GetCompletedItemsProps): GetCompletedItemsRes {
  const willDisappearObjectIds: string[] = [];
  const recentModifiedObjectIds = new Set<string>(options.recentModifiedObjectIds ?? []);
  const tagsFilter: TagFilter = options.tags ?? { type: 'all' };
  const allTagsSet = new Set<string>();
  const isEntityMatchedByTags = (entity: { tags?: string[] }): boolean => {
    if (tagsFilter.type === 'all') {
      return true;
    }
    if (tagsFilter.type === 'untagged') {
      return !entity.tags || entity.tags.length === 0;
    }
    return !!entity.tags?.includes(tagsFilter.value);
  };

  const completedTasks: (TaskInfo | ProjectInfoState)[] = modelData.taskList
    .filter((task: TaskObjectSchema) => {
      if (task.type === ModelTypes.project) {
        if (task.status === ItemStatusEnum.created) {
          return recentModifiedObjectIds.has(task.id);
        }
        return true;
      }
      if (task.type === ModelTypes.task) {
        if (task.status === ItemStatusEnum.created) {
          return recentModifiedObjectIds.has(task.id);
        }
        return true;
      }
      return false;
    })
    .map((task: TaskObjectSchema) => {
      if (task.type === ModelTypes.project) {
        return getProject(modelData, task.id);
      }
      if (task.type === ModelTypes.task) {
        const taskData = getTaskInfo(modelData, task.id);
        if (taskData.isSubTask) {
          return null;
        }
        return taskData;
      }
      return null;
    })
    .filter((o): o is TaskInfo | ProjectInfoState => !!o)
    .filter((o) => {
      o.tags?.forEach((tag) => allTagsSet.add(tag));
      const isRecentCreated = o.status === ItemStatusEnum.created && recentModifiedObjectIds.has(o.id);
      if (!isEntityMatchedByTags(o) && !isRecentCreated) {
        return false;
      }
      if (isRecentCreated) {
        willDisappearObjectIds.push(o.id);
      }
      return true;
    });

  completedTasks.sort((a: TaskInfo | ProjectInfoState, b: TaskInfo | ProjectInfoState) => {
    const dateA = a.completionAt || 0;
    const dateB = b.completionAt || 0;
    return dateB - dateA;
  });

  const groups: CompletedTaskGroup[] = [];
  const now = new Date(options.currentDate);
  completedTasks.forEach((task: TaskInfo | ProjectInfoState) => {
    const completedDate = task.completionAt ? new Date(task.completionAt) : new Date();
    let label: string;
    if (isSameWeek(completedDate, now)) {
      label = localize('logs.thisWeek', 'This Week');
    } else if (isSameYear(completedDate, now)) {
      label = format(completedDate, 'MMMM');
    } else {
      label = format(completedDate, 'MMMM yyyy');
    }
    const existingGroup = groups.find((g) => g.label === label);
    if (existingGroup) {
      existingGroup.tasks.push(task);
    } else {
      groups.push({
        label,
        tasks: [task],
      });
    }
  });

  return {
    groups,
    willDisappearObjectIds,
    allTags: Array.from(allTagsSet).sort(),
  };
}
