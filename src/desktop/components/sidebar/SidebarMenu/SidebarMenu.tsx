import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc.ts';
import { ChatIcon, InboxIcon, LogIcon, ScheduledIcon, TodayIcon } from '@/components/icons';
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
  { to: '/desktop/ai-chat', text: localize('ai_chat', 'AI Chat'), icon: <ChatIcon /> },
  { to: '/desktop/inbox', text: localize('inbox', 'Inbox'), icon: <InboxIcon /> },
  { to: '/desktop/today', text: localize('today', 'Today'), icon: <TodayIcon /> },
  { to: '/desktop/schedule', text: localize('schedule', 'Schedule'), icon: <ScheduledIcon /> },
  { to: '/desktop/completed', text: localize('completed', 'Completed'), icon: <LogIcon /> },
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
        const dueDateCount = isTodayLink ? todayItems.dueDateItemsCount : 0;

        return (
          <MenuItem
            key={index}
            to={link.to}
            text={link.text}
            icon={link.icon}
            primaryBadge={isTodayLink && dueDateCount > 0 ? dueDateCount : undefined}
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
