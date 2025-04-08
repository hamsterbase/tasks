import { ITaskModelData, TaskInfo } from '@/core/state/type.ts';
import { isTaskVisible } from '@/core/time/filterProjectAndTask';
import { TaskSchema } from '@/core/type.ts';
import type { TreeID } from 'loro-crdt';
import { getTaskInfo } from '../getTaskInfo';

interface GetInboxTasksOptions {
  // 当前日期时间戳
  currentDate: number;
  /**
   * 显示在 showCompletedTasksAfter 之后完成的任务
   * 如果 showCompletedTasksAfter 不传，则不显示任何完成的任务
   */
  showCompletedTasksAfter: number;
  /**
   * 是否显示 startDate 在 currentDate 之后的任务
   */
  showFutureTasks: boolean;

  keepAliveElements: string[];
  /**
   * 是否显示所有完成的任务
   */
  showCompletedTasks: boolean;
}

interface GetInboxTasksResult {
  willDisappearObjectIdSet: Set<string>;
  /**
   * 1. 如果 showCompletedTasksAfter 不传，则不显示任何完成的任务
   * 2. 如果 showCompletedTasksAfter 传了，则显示在 showCompletedTasksAfter 之后完成的任务
   * 3. 如果 showFutureTasks 传了，则显示在 startDate > currentDate 的任务
   */
  inboxTasks: TaskInfo[];

  /**
   * inboxTasks 中未完成的任务数量
   */
  uncompletedTasksCount: number;
}

export function getInboxTasks(modelData: ITaskModelData, options: GetInboxTasksOptions): GetInboxTasksResult {
  const recentChangedTaskSet = new Set<TreeID>(options.keepAliveElements as TreeID[]);
  const willDisappearObjectIdSet = new Set<string>();
  const inboxTasks = modelData.rootObjectIdList
    .filter((id) => {
      const task = modelData.taskObjectMap.get(id) as TaskSchema;
      if (!task || task.type !== 'task') {
        return false;
      }
      return true;
    })
    .map((taskId: TreeID): TaskInfo => {
      return getTaskInfo(modelData, taskId) as TaskInfo;
    })
    .filter((task) => {
      const taskState = isTaskVisible(task, {
        currentDate: options.currentDate,
        showFutureTasks: options.showFutureTasks,
        showCompletedTasks: options.showCompletedTasks,
        completedAfter: options.showCompletedTasksAfter,
        recentChangedTaskSet,
      });
      if (taskState === 'invalid') {
        return false;
      }
      if (taskState === 'recentChanged') {
        willDisappearObjectIdSet.add(task.id);
      }
      return true;
    });

  const uncompletedTasksCount = inboxTasks.filter((task) => task.status === 'created').length;

  return {
    inboxTasks,
    uncompletedTasksCount,
    willDisappearObjectIdSet,
  };
}
