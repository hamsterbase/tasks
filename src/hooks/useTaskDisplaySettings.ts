import { getTimeAfter } from '@/core/time/getTimeAfter';
import {
  completedTasksRangeConfigKey,
  showCompletedTasksConfigKey,
  showFutureTasksConfigKey,
} from '@/services/config/config';
import { useConfig } from './useConfig';
import { useGlobalTaskDisplaySettings } from './useGlobalTaskDisplaySettings';

export const useTaskDisplaySettings = (page: string) => {
  const globalSettings = useGlobalTaskDisplaySettings();
  const { value: showFutureTasks } = useConfig(showFutureTasksConfigKey(page, globalSettings.showFutureTasks));
  const { value: showCompletedTasks } = useConfig(showCompletedTasksConfigKey(page, globalSettings.showCompletedTasks));
  const { value: completedTasksRange } = useConfig(
    completedTasksRangeConfigKey(page, globalSettings.completedTasksRange)
  );

  return {
    showFutureTasks,
    showCompletedTasks,
    completedAfter: getTimeAfter(Date.now(), completedTasksRange),
  };
};
