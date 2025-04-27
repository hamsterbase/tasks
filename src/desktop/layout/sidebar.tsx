import { InboxIcon, LogIcon, ScheduledIcon, TodayIcon } from '@/components/icons';
import { localize } from '@/nls';
import { Allotment } from 'allotment';
import classNames from 'classnames';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { desktopStyles } from '../theme/main';

export const SidebarLayout = () => {
  const location = useLocation();
  const links = [
    { to: '/desktop/inbox', text: localize('inbox', 'Inbox'), icon: <InboxIcon /> },
    { to: '/desktop/today', text: localize('today', 'Today'), icon: <TodayIcon /> },
    { to: '/desktop/schedule', text: localize('schedule', 'Schedule'), icon: <ScheduledIcon /> },
    { to: '/desktop/completed', text: localize('completed', 'Completed'), icon: <LogIcon /> },
  ];

  return (
    <div className="h-screen w-screen">
      <Allotment>
        <Allotment.Pane minSize={200} maxSize={300}>
          <div className={classNames(desktopStyles.sidebarBackground, 'w-full h-full p-4')}>
            <nav>
              <ul className="space-y-0.5">
                {links.map((link, index) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <li key={index}>
                      <Link
                        to={link.to}
                        className={classNames('block px-2 py-1.5 rounded cursor-pointer', {
                          'font-medium bg-brand text-white': isActive,
                          'hover:bg-bg3': !isActive,
                        })}
                      >
                        <div className={classNames('flex items-center gap-2 h-4.5')}>
                          <div className="size-4 flex items-center justify-center text-sm">{link.icon}</div>
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
          <Outlet></Outlet>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
