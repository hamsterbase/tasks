import { taskDisplaySettingOptions } from '@/base/common/TaskDisplaySettings';
import { getTimeAfter, TimeAfterEnum } from '@/core/time/getTimeAfter.ts';
import { DesktopMenuController, IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import {
  completedTasksRangeConfigKey,
  showCompletedTasksConfigKey,
  showFutureTasksConfigKey,
} from '@/services/config/config.ts';
import { useGlobalTaskDisplaySettings } from '@/hooks/useGlobalTaskDisplaySettings';
import { localize } from '@/nls.ts';
import { IInstantiationService } from 'vscf/platform/instantiation/common.ts';
import { useService } from '@/hooks/use-service.ts';
import { useConfig } from '@/hooks/useConfig.ts';

interface UseDesktopTaskDisplaySettingsOption {
  hideShowFutureTasks?: boolean;
}

export const useDesktopTaskDisplaySettings = (page: string, option?: UseDesktopTaskDisplaySettingsOption) => {
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

  function createMenuConfig(): IMenuConfig[] {
    const menuItems: IMenuConfig[] = [];

    if (!option?.hideShowFutureTasks) {
      menuItems.push({
        label: localize('display_settings.future_tasks', 'Future Tasks'),
        checked: showFutureTasks,
        onSelect: () => setShowFutureTasks(!showFutureTasks),
      });
    }

    menuItems.push({
      label: localize('display_settings.completed_tasks', 'Completed Tasks'),
      checked: showCompletedTasks,
      onSelect: () => setShowCompletedTasks(!showCompletedTasks),
    });

    const completedRangeSubmenu: IMenuConfig[][] = [
      taskDisplaySettingOptions.completedTasksRange.options.map((option) => ({
        label: option.label,
        checked: completedTasksRange === option.value,
        onSelect: () => setCompletedTasksRange(option.value as TimeAfterEnum),
      })),
    ];

    menuItems.push({
      label: localize('display_settings.completed_tasks_range', 'Completed Tasks Range'),
      submenu: completedRangeSubmenu,
    });

    return menuItems;
  }

  function openTaskDisplaySettings(x: number, y: number) {
    const menuConfig = createMenuConfig();
    DesktopMenuController.create(
      {
        menuConfig,
        x,
        y,
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
