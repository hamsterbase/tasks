import { Allotment } from 'allotment';
import classNames from 'classnames';
import React from 'react';
import { Link, Outlet } from 'react-router';
import { desktopStyles } from '../theme/main';

export const SidebarLayout = () => {
  const links = [
    { to: '/desktop/inbox', text: '收件箱' },
    { to: '/desktop/today', text: '今天' },
    { to: '/desktop/schedule', text: '日程' },
    { to: '/desktop/completed', text: '已完成' },
  ];

  return (
    <div className="h-screen w-screen">
      <Allotment>
        <Allotment.Pane minSize={200} maxSize={300}>
          <div className={classNames(desktopStyles.sidebarBackground, 'w-full h-full p-4')}>
            {
              <nav>
                <ul className="space-y-2">
                  {links.map((link, index) => (
                    <li key={index}>
                      <Link to={link.to} className="block p-2 hover:bg-bg3 rounded cursor-pointer">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            }
          </div>
        </Allotment.Pane>
        <Allotment.Pane>
          <Outlet></Outlet>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
