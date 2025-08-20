import classNames from 'classnames';
import React from 'react';
import { Link, useLocation } from 'react-router';
import { desktopStyles } from '../../theme/main';

export interface MenuItemProps {
  to: string;
  text: string;
  icon: React.ReactNode;
  primaryBadge?: number;
  secondaryBadge?: number;
}

export const MenuItem: React.FC<MenuItemProps> = ({ to, text, icon, primaryBadge, secondaryBadge }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  const secondaryBadgeClassName = classNames({
    [desktopStyles.SidebarMenuItemBadgeSecondaryActive]: isActive,
    [desktopStyles.SidebarMenuItemBadgeSecondary]: !isActive,
  });

  return (
    <li>
      <Link
        to={to}
        className={classNames(desktopStyles.SidebarMenuItem, {
          [desktopStyles.SidebarMenuItemActive]: isActive,
          [desktopStyles.SidebarMenuItemInactive]: !isActive,
        })}
      >
        <div className={desktopStyles.SidebarMenuItemIcon}>{icon}</div>
        <div className={desktopStyles.SidebarMenuItemLabel}>{text}</div>
        {primaryBadge !== undefined && primaryBadge > 0 && (
          <span className={desktopStyles.SidebarMenuItemBadgePrimary}>{primaryBadge}</span>
        )}
        {secondaryBadge !== undefined && secondaryBadge > 0 && (
          <span className={secondaryBadgeClassName}>{secondaryBadge}</span>
        )}
      </Link>
    </li>
  );
};
