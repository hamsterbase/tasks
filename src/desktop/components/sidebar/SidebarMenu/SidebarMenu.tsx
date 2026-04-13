import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc.ts';
import { CalendarIcon, CheckIcon, InboxIcon, TodayIcon } from '@/components/icons';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import React from 'react';
import { desktopStyles } from '../../../theme/main';
import { MenuItem } from '../../MenuItem/MenuItem.tsx';

const links = [
  { to: '/desktop/inbox', text: localize('inbox', 'Inbox'), icon: <InboxIcon /> },
  { to: '/desktop/today', text: localize('today', 'Today'), icon: <TodayIcon /> },
  { to: '/desktop/schedule', text: localize('schedule', 'Schedule'), icon: <CalendarIcon /> },
  { to: '/desktop/completed', text: localize('completed', 'Completed'), icon: <CheckIcon /> },
];

export const SidebarMenu: React.FC = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const todayItems = getTodayItems(todoService.modelState, getTodayTimestampInUtc());
  const { showFutureTasks, showCompletedTasks, completedAfter } = useTaskDisplaySettings('inbox');
  const { uncompletedTasksCount } = getInboxTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    showFutureTasks,
    showCompletedTasks,
    showCompletedTasksAfter: completedAfter,
    keepAliveElements: todoService.keepAliveElements,
  });

  return (
    <ul className={desktopStyles.SidebarMenuItemContainer}>
      {links.map((link, index) => {
        const isTodayLink = link.to === '/desktop/today';
        const isInboxLink = link.to === '/desktop/inbox';
        const startDateCount = isTodayLink ? todayItems.startDateItemsCount : 0;
        return (
          <MenuItem
            key={index}
            to={link.to}
            text={link.text}
            icon={link.icon}
            primaryBadge={undefined}
            secondaryBadge={
              isTodayLink && startDateCount > 0
                ? startDateCount
                : isInboxLink && uncompletedTasksCount > 0
                  ? uncompletedTasksCount
                  : undefined
            }
          />
        );
      })}

      <div className={desktopStyles.SidebarMenuDivider}></div>
    </ul>
  );
};
