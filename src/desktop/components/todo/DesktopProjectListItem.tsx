import { ChevronRightIcon, DragHandleIcon } from '@/components/icons';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox';
import { getProjectItemTags } from '@/core/state/getProjectItemTags';
import { ProjectInfoState } from '@/core/state/type';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { Link } from 'react-router';
import { ItemTagsList } from './ItemTagsList';
import classNames from 'classnames';

interface DesktopProjectListItemProps {
  project: ProjectInfoState;
  disableDrag?: boolean;
}

export const DesktopProjectListItem: React.FC<DesktopProjectListItemProps> = ({ project, disableDrag }) => {
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
    hideParent: false,
  });

  return (
    <Link
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      to={`/desktop/project/${project.uid}`}
      className={classNames(
        'min-h-11 no-underline flex items-start gap-3 px-3 py-3 rounded-lg group relative cursor-default',
        {
          ['bg-bg3']: isDragging,
        }
      )}
    >
      {!disableDrag && (
        <DragHandleIcon className="absolute -left-5 top-1/2 -translate-y-1/2 size-5 text-t3 opacity-0 group-hover:opacity-60 transition-opacity" />
      )}
      <div className="flex-shrink-0" style={{ visibility: isDragging ? 'hidden' : 'visible' }}>
        <ProjectStatusBox progress={progress} status={project.status} className="size-5" color="t2" />
      </div>
      <div className="flex-1 min-w-0 flex gap-2 flex-col" style={{ visibility: isDragging ? 'hidden' : 'visible' }}>
        <h3 className="text-base font-base text-t2 truncate leading-5">
          {project.title || localize('project.untitled', 'New Project')}
        </h3>
        <ItemTagsList tags={tags} isSelected={false} />
      </div>
      <div
        className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity size-5 text-t3"
        style={{ visibility: isDragging ? 'hidden' : 'visible' }}
      >
        <ChevronRightIcon />
      </div>
    </Link>
  );
};
