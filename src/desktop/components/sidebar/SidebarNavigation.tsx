import { getTodayTimestampInUtc } from '@/base/common/time';
import { InboxIcon, LogIcon, ScheduledIcon, TodayIcon } from '@/components/icons';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import classNames from 'classnames';
import React from 'react';
import { Link, useLocation } from 'react-router';
import { desktopStyles } from '../../theme/main';

const links = [
  { to: '/desktop/inbox', text: localize('inbox', 'Inbox'), icon: <InboxIcon /> },
  { to: '/desktop/today', text: localize('today', 'Today'), icon: <TodayIcon /> },
  { to: '/desktop/schedule', text: localize('schedule', 'Schedule'), icon: <ScheduledIcon /> },
  { to: '/desktop/completed', text: localize('completed', 'Completed'), icon: <LogIcon /> },
];

export const SidebarNavigation: React.FC = () => {
  const location = useLocation();
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const todayItems = getTodayItems(todoService.modelState, getTodayTimestampInUtc());

  return (
    <ul className={desktopStyles.sidebarItemGap}>
      {links.map((link, index) => {
        const isActive = location.pathname === link.to;
        const isTodayLink = link.to === '/desktop/today';
        const startDateCount = isTodayLink ? todayItems.startDateItemsCount : 0;
        const dueDateCount = isTodayLink ? todayItems.dueDateItemsCount : 0;

        return (
          <li key={index}>
            <Link
              to={link.to}
              className={classNames(desktopStyles.sidebarItemContainerStyle, {
                [desktopStyles.sidebarLinkActive]: isActive,
                [desktopStyles.sidebarLinkInactive]: !isActive,
              })}
            >
              <div
                className={classNames(
                  desktopStyles.sidebarItemHeight,
                  desktopStyles.sidebarItemTextStyle,
                  'flex items-center gap-2 justify-between w-full'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={desktopStyles.sidebarIconSize}>{link.icon}</div>
                  {link.text}
                </div>
                {isTodayLink && (startDateCount > 0 || dueDateCount > 0) && (
                  <div className="flex items-center gap-1">
                    {dueDateCount > 0 && (
                      <span className="text-xs text-white bg-red-500 px-1.5 py-0.5 rounded">{dueDateCount}</span>
                    )}
                    {startDateCount > 0 && (
                      <span className="text-xs text-t3 bg-bg2 px-1.5 py-0.5 rounded">{startDateCount}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
