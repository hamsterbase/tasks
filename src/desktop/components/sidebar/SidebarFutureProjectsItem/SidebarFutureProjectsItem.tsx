import { LaterProjectsIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router';

interface SidebarFutureProjectsItemProps {
  count?: number;
}

export const SidebarFutureProjectsItem: React.FC<SidebarFutureProjectsItemProps> = ({ count }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: DragDropElements.futureProjects,
    disabled: true,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isActive = location.pathname === '/desktop/future_projects';
  const sidebarFutureTasksClass = classNames(desktopStyles.SidebarMenuItem, {
    [desktopStyles.SidebarMenuItemActive]: isActive,
    [desktopStyles.SidebarMenuItemInactive]: !isActive,
  });

  const secondaryBadgeClassName = classNames({
    [desktopStyles.SidebarMenuItemBadgeSecondaryActive]: isActive,
    [desktopStyles.SidebarMenuItemBadgeSecondary]: !isActive,
  });

  return (
    <Link
      to="/desktop/future_projects"
      className={sidebarFutureTasksClass}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className={desktopStyles.SidebarMenuItemIcon}>
        <LaterProjectsIcon />
      </div>
      <span className={desktopStyles.SidebarMenuItemLabel}>{localize('home.futureProjects', 'Future Projects')}</span>
      {<span className={secondaryBadgeClassName}>{count}</span>}
    </Link>
  );
};
