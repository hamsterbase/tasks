import { ProjectInfoState } from '@/core/state/type';
import { ProjectStatusIcon } from '@/desktop/components/sidebar/ProjectStatusIcon';
import { TaskItemCompletionAt } from '@/desktop/components/taskListItem/TaskItemCompletionAt';
import { localize } from '@/nls';
import React from 'react';
import { Link } from 'react-router';
import { ChevronRightIcon } from '@/components/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DesktopProjectListItemProps {
  project: ProjectInfoState;
}

export const DesktopProjectListItem: React.FC<DesktopProjectListItemProps> = ({ project }) => {
  const progress = project.progress || 0;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.6 : 1,
    pointerEvents: (isDragging ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link to={`/desktop/project/${project.uid}`} className="block no-underline">
        <div className="flex items-center gap-3 px-3 py-2 hover:bg-bg2 rounded-md transition-colors cursor-pointer group">
          <div className="flex-shrink-0">
            <ProjectStatusIcon progress={progress} status={project.status} />
          </div>
          <TaskItemCompletionAt completionAt={project.completionAt} status={project.status} />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-t1 truncate">
              {project.title || localize('project.untitled', 'New Project')}
            </h3>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRightIcon className="w-4 h-4 text-t3" />
          </div>
        </div>
      </Link>
    </div>
  );
};
