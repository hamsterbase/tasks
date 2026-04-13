import { ProjectInfoState } from '@/core/state/type';
import { formatDueDateInList } from '@/core/time/formatDueDateInList';
import { isPastOrToday } from '@/core/time/isPast';
import { localize } from '@/nls';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { Link, useLocation } from 'react-router';
import { desktopStyles } from '../../../theme/main';
import { ProjectIcon } from '../../todo/ProjectIcon';

interface SidebarProjectItemProps {
  projectInfo: ProjectInfoState;
}

function getSidebarProjectDueDateStyle(dueDate: number, isActive: boolean): string {
  if (!dueDate) return '';
  if (isActive) {
    return desktopStyles.SidebarProjectItemDueDateActive;
  }
  if (isPastOrToday(dueDate)) {
    return desktopStyles.SidebarProjectItemDueDateDanger;
  }
  return desktopStyles.SidebarProjectItemDueDateInactive;
}

export const SidebarProjectItem: React.FC<SidebarProjectItemProps> = ({ projectInfo }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: projectInfo.id,
  });
  const location = useLocation();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    pointerEvents: (isDragging ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
  };

  const isActive = location.pathname === `/desktop/project/${projectInfo.uid}`;

  const sidebarProjectClass = classNames(desktopStyles.SidebarMenuItem, {
    [desktopStyles.SidebarProjectItemActive]: isActive,
    [desktopStyles.SidebarProjectItemInactive]: !isActive,
  });

  return (
    <Link
      to={`/desktop/project/${projectInfo.uid}`}
      className={sidebarProjectClass}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className={classNames(desktopStyles.SidebarProjectItemIcon)}>
        <ProjectIcon progress={projectInfo.progress} status={projectInfo.status} size="md" />
      </div>
      <span className={classNames(desktopStyles.SidebarMenuItemLabel)}>
        {projectInfo.title || localize('project.untitled', 'New Project')}
      </span>

      {projectInfo.dueDate && (
        <div
          className={classNames(
            desktopStyles.SidebarProjectItemDueDate,
            getSidebarProjectDueDateStyle(projectInfo.dueDate, isActive)
          )}
        >
          {formatDueDateInList(projectInfo.dueDate)}
        </div>
      )}
    </Link>
  );
};
