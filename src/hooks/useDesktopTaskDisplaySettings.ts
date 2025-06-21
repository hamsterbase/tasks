import { getTimeAfter, TimeAfterEnum } from '@/core/time/getTimeAfter';
import { DesktopMenuController, IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import {
  completedTasksRangeConfigKey,
  showCompletedTasksConfigKey,
  showFutureTasksConfigKey,
} from '@/services/config/config';
import { localize } from '@/nls';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { useService } from './use-service';
import { useConfig } from './useConfig';

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
        label: 'Future Tasks',
        checked: showFutureTasks,
        onSelect: () => setShowFutureTasks(!showFutureTasks),
      });
    }

    menuItems.push({
      label: 'Completed Tasks',
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
      label: 'Completed Tasks Range',
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
