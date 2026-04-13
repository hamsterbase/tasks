import { DragHandleIcon, NotesIcon } from '@/components/icons';
import { getProjectItemTags } from '@/core/state/getProjectItemTags';
import { ProjectInfoState } from '@/core/state/type';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { Link } from 'react-router';
import { ItemTagsList } from './ItemTagsList';
import classNames from 'classnames';
import { ProjectIcon } from './ProjectIcon';

interface DesktopProjectListItemProps {
  project: ProjectInfoState;
  disableDrag?: boolean;
  hideProjectTitle?: boolean;
}

export const DesktopProjectListItem: React.FC<DesktopProjectListItemProps> = ({
  project,
  disableDrag,
  hideProjectTitle,
}) => {
  const progress = project.progress || 0;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: project.id,
    disabled: disableDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.6 : 1,
    pointerEvents: (isDragging ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
  };

  const todoService = useService(ITodoService);

  const tags = getProjectItemTags(todoService.modelState, {
    projectId: project.id,
    hideParent: hideProjectTitle ?? false,
  });

  return (
    <Link
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      to={`/desktop/project/${project.uid}`}
      className={classNames(desktopStyles.DesktopProjectListItemLink, {
        [desktopStyles.DesktopProjectListItemDragging]: isDragging,
      })}
    >
      {!disableDrag && <DragHandleIcon className={desktopStyles.DesktopProjectListItemDragHandle} />}
      <div
        className={desktopStyles.DesktopProjectListItemStatusBox}
        style={{ visibility: isDragging ? 'hidden' : 'visible' }}
      >
        <ProjectIcon
          progress={progress}
          status={project.status}
          size="md"
          className={desktopStyles.DesktopProjectListItemStatusBoxIcon}
        />
      </div>
      <div
        className={desktopStyles.DesktopProjectListItemContent}
        style={{ visibility: isDragging ? 'hidden' : 'visible' }}
      >
        <div className={desktopStyles.TaskListItemTitleRow}>
          <h3 className={desktopStyles.DesktopProjectListItemTitle}>
            {project.title || localize('project.untitled', 'New Project')}
          </h3>
          {project.notes && <NotesIcon className={desktopStyles.TaskListItemIcon} />}
        </div>
        <ItemTagsList tags={tags} isSelected={false} />
      </div>
    </Link>
  );
};
