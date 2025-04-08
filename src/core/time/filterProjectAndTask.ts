import { TreeID } from 'loro-crdt';
import { ProjectInfoState, TaskInfo } from '../state/type';

export interface FilterOption {
  showCompletedTasks: boolean;
  showFutureTasks: boolean;
  currentDate: number;
  completedAfter: number;
  recentChangedTaskSet: Set<TreeID>;
}

export type Res = 'valid' | 'invalid' | 'recentChanged';

export function isTaskVisible(task: TaskInfo | ProjectInfoState, option?: FilterOption): Res {
  if (!option) {
    return 'valid';
  }
  if (!option.showCompletedTasks) {
    if (task.status !== 'created') {
      if (option.recentChangedTaskSet.has(task.id)) {
        return 'recentChanged';
      }
      return 'invalid';
    }
  } else {
    if (task.status !== 'created' && task.completionAt && task.completionAt < option.completedAfter) {
      if (option.recentChangedTaskSet.has(task.id)) {
        return 'recentChanged';
      }
      return 'invalid';
    }
  }
  if (!option.showFutureTasks) {
    if (task.startDate && task.startDate > option.currentDate) {
      if (option.recentChangedTaskSet.has(task.id)) {
        return 'recentChanged';
      }
      return 'invalid';
    }
  }
  return 'valid';
}
