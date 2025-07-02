import { LaterProjectsIcon } from '@/components/icons';
import { localize } from '@/nls';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router';
import { desktopStyles } from '../../theme/main';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';

interface SidebarFutureTasksItemProps {
  count?: number;
}

export const SidebarFutureTasksItem: React.FC<SidebarFutureTasksItemProps> = ({ count }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: DragDropElements.futureProjects,
    disabled: true,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-0.5">
      <Link
        to="/desktop/future_projects"
        className={classNames(desktopStyles.sidebarItemContainerStyle, desktopStyles.sidebarLinkInactive)}
      >
        <div
          className={classNames(
            desktopStyles.sidebarItemHeight,
            desktopStyles.sidebarItemTextStyle,
            'flex items-center gap-2'
          )}
        >
          <div className={classNames(desktopStyles.sidebarIconSize, 'text-t3')}>
            <LaterProjectsIcon />
          </div>
          <span className="flex-1">{localize('home.futureProjects', 'Future Projects')}</span>
          {count !== undefined && count > 0 && (
            <span className="text-xs text-t3 bg-bg2 px-1.5 py-0.5 rounded">{count}</span>
          )}
        </div>
      </Link>
    </div>
  );
};
