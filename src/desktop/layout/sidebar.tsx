import { InboxIcon, LogIcon, ScheduledIcon, TodayIcon } from '@/components/icons';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { SelectionPanel } from '@/selection/SelectionPanel';
import { ISelectionService } from '@/services/selection/common/selectionService';
import { Allotment } from 'allotment';
import classNames from 'classnames';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { desktopStyles } from '../theme/main';

export const SidebarLayout = () => {
  const location = useLocation();
  const selectionService = useService(ISelectionService);

  useWatchEvent(selectionService.onSelectionChanged);

  const links = [
    { to: '/desktop/inbox', text: localize('inbox', 'Inbox'), icon: <InboxIcon /> },
    { to: '/desktop/today', text: localize('today', 'Today'), icon: <TodayIcon /> },
    { to: '/desktop/schedule', text: localize('schedule', 'Schedule'), icon: <ScheduledIcon /> },
    { to: '/desktop/completed', text: localize('completed', 'Completed'), icon: <LogIcon /> },
  ];




  return (
    <div className="h-screen w-screen relative">
      <Allotment>
        <Allotment.Pane minSize={200} maxSize={300} snap>
          <div className={classNames(desktopStyles.sidebarBackground, desktopStyles.sidebarContainerStyle)}>
            <nav>
              <ul className={desktopStyles.sidebarItemGap}>
                {links.map((link, index) => {
                  const isActive = location.pathname === link.to;
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
                            'flex items-center gap-2'
                          )}
                        >
                          <div className={desktopStyles.sidebarIconSize}>{link.icon}</div>
                          {link.text}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </Allotment.Pane>
        <Allotment.Pane>
          <Allotment>
            <Allotment.Pane>
              <Outlet />
            </Allotment.Pane>
            <Allotment.Pane minSize={300} preferredSize={400}>
              <SelectionPanel />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
