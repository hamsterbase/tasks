import { taskDisplaySettingOptions } from '@/base/common/TaskDisplaySettings';
import { getTimeAfter } from '@/core/time/getTimeAfter';
import {
  completedTasksRangeConfigKey,
  showCompletedTasksConfigKey,
  showFutureTasksConfigKey,
} from '@/services/config/config';
import { useConfig } from './useConfig';

export const useGlobalTaskDisplaySettings = () => {
  const { value: showFutureTasks, setValue: setShowFutureTasks } = useConfig(showFutureTasksConfigKey('global'));
  const { value: showCompletedTasks, setValue: setShowCompletedTasks } = useConfig(
    showCompletedTasksConfigKey('global')
  );
  const { value: completedTasksRange, setValue: setCompletedTasksRange } = useConfig(
    completedTasksRangeConfigKey('global')
  );

  return {
    showFutureTasks,
    showCompletedTasks,
    completedTasksRange,
    completedAfter: getTimeAfter(Date.now(), completedTasksRange),
    setShowFutureTasks,
    setShowCompletedTasks,
    setCompletedTasksRange,
    settingOptions: taskDisplaySettingOptions,
  };
};
