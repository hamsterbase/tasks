import { getTimeAfter, TimeAfterEnum } from '@/core/time/getTimeAfter.ts';
import { DesktopMenuController, IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import {
  completedTasksRangeConfigKey,
  showCompletedTasksConfigKey,
  showFutureTasksConfigKey,
} from '@/services/config/config.ts';
import { localize } from '@/nls.ts';
import { IInstantiationService } from 'vscf/platform/instantiation/common.ts';
import { useService } from '@/hooks/use-service.ts';
import { useConfig } from '@/hooks/useConfig.ts';

interface UseDesktopTaskDisplaySettingsOption {
  hideShowFutureTasks?: boolean;
}

export const useDesktopTaskDisplaySettings = (page: string, option?: UseDesktopTaskDisplaySettingsOption) => {
  const instantiationService = useService(IInstantiationService);
  const { value: showFutureTasks, setValue: setShowFutureTasks } = useConfig(showFutureTasksConfigKey(page));
  const { value: showCompletedTasks, setValue: setShowCompletedTasks } = useConfig(showCompletedTasksConfigKey(page));
  const { value: completedTasksRange, setValue: setCompletedTasksRange } = useConfig(
    completedTasksRangeConfigKey(page)
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

    // 完成任务范围作为子菜单
    const completedRangeSubmenu: IMenuConfig[][] = [
      [
        {
          label: localize('inbox.completed_range.today.short', 'Today'),
          checked: completedTasksRange === 'today',
          onSelect: () => setCompletedTasksRange('today' as TimeAfterEnum),
        },
        {
          label: localize('inbox.completed_range.day.short', 'Past day'),
          checked: completedTasksRange === 'day',
          onSelect: () => setCompletedTasksRange('day' as TimeAfterEnum),
        },
        {
          label: localize('inbox.completed_range.week.short', 'Past week'),
          checked: completedTasksRange === 'week',
          onSelect: () => setCompletedTasksRange('week' as TimeAfterEnum),
        },
        {
          label: localize('inbox.completed_range.month.short', 'Past month'),
          checked: completedTasksRange === 'month',
          onSelect: () => setCompletedTasksRange('month' as TimeAfterEnum),
        },
        {
          label: localize('inbox.completed_range.all.short', 'All'),
          checked: completedTasksRange === 'all',
          onSelect: () => setCompletedTasksRange('all' as TimeAfterEnum),
        },
      ],
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
