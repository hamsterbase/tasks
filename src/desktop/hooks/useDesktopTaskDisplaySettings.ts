import { taskDisplaySettingOptions } from '@/base/common/TaskDisplaySettings';
import { getTimeAfter, TimeAfterEnum } from '@/core/time/getTimeAfter.ts';
import { DesktopMenuController, IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import { useService } from '@/hooks/use-service.ts';
import { useConfig } from '@/hooks/useConfig.ts';
import { useGlobalTaskDisplaySettings } from '@/hooks/useGlobalTaskDisplaySettings';
import {
  completedTasksRangeConfigKey,
  showCompletedTasksConfigKey,
  showFutureTasksConfigKey,
} from '@/services/config/config.ts';
import { IInstantiationService } from 'vscf/platform/instantiation/common.ts';

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
        label: globalSettings.settingOptions.showFutureTasks.title,
        checked: showFutureTasks,
        onSelect: () => setShowFutureTasks(!showFutureTasks),
      });
    }

    menuItems.push({
      label: globalSettings.settingOptions.showCompletedTasks.title,
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
      label: globalSettings.settingOptions.completedTasksRange.title,
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
