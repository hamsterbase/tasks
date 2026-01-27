import { getTimeAfter } from '@/core/time/getTimeAfter';
import { useService } from '@/hooks/use-service';
import { useConfig } from '@/hooks/useConfig';
import { useGlobalTaskDisplaySettings } from '@/hooks/useGlobalTaskDisplaySettings';
import { TaskDisplaySettingsController } from '@/mobile/overlay/taskDisplaySettings/TaskDisplaySettingsController';
import {
  completedTasksRangeConfigKey,
  showCompletedTasksConfigKey,
  showFutureTasksConfigKey,
} from '@/services/config/config';
import { IInstantiationService } from 'vscf/platform/instantiation/common';

interface useTaskDisplaySettingsOption {
  hideShowFutureTasks?: boolean;
}

export const useTaskDisplaySettingsMobile = (page: string, option?: useTaskDisplaySettingsOption) => {
  const instantiationService = useService(IInstantiationService);
  const globalSettings = useGlobalTaskDisplaySettings();
  const { value: showFutureTasks, setValue: setShowFutureTasks } = useConfig(
    showFutureTasksConfigKey(page, globalSettings.showFutureTasks)
  );
  const { value: showCompletedTasks, setValue: setShowCompletedTasks } = useConfig(
    showCompletedTasksConfigKey(page, globalSettings.showCompletedTasks)
  );
  const { value: completedTasksRange, setValue: setCompletedTasksRange } = useConfig(
    completedTasksRangeConfigKey(page, globalSettings.completedTasksRange)
  );

  function openTaskDisplaySettings() {
    TaskDisplaySettingsController.create(
      {
        showFutureTasks,
        showCompletedTasks,
        completedTasksRange,
        hideShowFutureTasks: option?.hideShowFutureTasks,
        onChange: (value) => {
          setShowFutureTasks(value.showFutureTasks);
          setShowCompletedTasks(value.showCompletedTasks);
          setCompletedTasksRange(value.completedTasksRange);
        },
      },
      instantiationService
    );
  }

  return {
    showFutureTasks,
    showCompletedTasks,
    completedAfter: getTimeAfter(Date.now(), completedTasksRange),
    openTaskDisplaySettings,
  };
};
