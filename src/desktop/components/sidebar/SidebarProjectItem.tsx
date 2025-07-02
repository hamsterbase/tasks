import { ProjectInfoState } from '@/core/state/type';
import { localize } from '@/nls';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { Link, useLocation } from 'react-router';
import { desktopStyles } from '../../theme/main';
import { ProjectStatusIcon } from './ProjectStatusIcon';

interface SidebarProjectItemProps {
  projectInfo: ProjectInfoState;
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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-0.5">
      <Link
        to={`/desktop/project/${projectInfo.uid}`}
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
          <div className={classNames(desktopStyles.sidebarIconSize, 'text-t3')}>
            <ProjectStatusIcon
              progress={projectInfo.progress}
              status={projectInfo.status}
              isActive={isActive}
            />
          </div>
          <span className={classNames({'text-t3': !projectInfo.title})}>{projectInfo.title || localize('project.untitled', 'New Project')}</span>
        </div>
      </Link>
    </div>
  );
};
