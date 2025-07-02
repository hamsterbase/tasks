import { InboxIcon, LogIcon, ScheduledIcon, TodayIcon } from '@/components/icons';
import { localize } from '@/nls';
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

  return (
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
  );
};