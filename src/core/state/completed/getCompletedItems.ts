import { ItemStatusEnum, ModelTypes } from '@/core/enum';
import { TaskObjectSchema } from '@/core/type';
import { localize } from '@/nls';
import { format, isSameWeek, isSameYear } from 'date-fns';
import { getProject } from '../getProject';
import { getTaskInfo } from '../getTaskInfo';
import { ITaskModelData, ProjectInfoState, TaskInfo } from '../type';

export interface GetCompletedItemsProps {
  currentDate: number;
  recentModifiedObjectIds?: string[];
}

export interface GetCompletedItemsRes {
  groups: CompletedTaskGroup[];
  willDisappearObjectIds: string[];
}

interface CompletedTaskGroup {
  label: string;
  tasks: (TaskInfo | ProjectInfoState)[];
}

export function getCompletedItems(modelData: ITaskModelData, options: GetCompletedItemsProps): GetCompletedItemsRes {
  const willDisappearObjectIds: string[] = [];
  const recentModifiedObjectIds = new Set<string>(options.recentModifiedObjectIds ?? []);

  const completedTasks: (TaskInfo | ProjectInfoState)[] = modelData.taskList
    .filter((task: TaskObjectSchema) => {
      if (task.type === ModelTypes.project) {
        if (task.status === ItemStatusEnum.created) {
          if (recentModifiedObjectIds.has(task.id)) {
            willDisappearObjectIds.push(task.id);
            return true;
          }
          return false;
        }
        return true;
      }
      if (task.type === ModelTypes.task) {
        if (task.status === ItemStatusEnum.created) {
          if (recentModifiedObjectIds.has(task.id)) {
            willDisappearObjectIds.push(task.id);
            return true;
          }
          return false;
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
    .filter((o): o is TaskInfo | ProjectInfoState => !!o);

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
  };
}
