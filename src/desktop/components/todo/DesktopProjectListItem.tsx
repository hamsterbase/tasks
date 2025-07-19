import { ChevronRightIcon } from '@/components/icons';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox';
import { ProjectInfoState } from '@/core/state/type';
import { TaskItemCompletionAt } from '@/desktop/components/taskListItem/TaskItemCompletionAt';
import { TaskItemDueDate } from '@/desktop/components/taskListItem/TaskItemDueDate';
import { TaskItemStartDate } from '@/desktop/components/taskListItem/TaskItemStartDate';
import { localize } from '@/nls';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { Link } from 'react-router';

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
            <ProjectStatusBox progress={progress} status={project.status} className="size-5" color="t3" />
          </div>
          <TaskItemCompletionAt completionAt={project.completionAt} status={project.status} />
          <TaskItemStartDate startDate={project.startDate} />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-t1 truncate">
              {project.title || localize('project.untitled', 'New Project')}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <TaskItemDueDate dueDate={project.dueDate} />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRightIcon className="w-4 h-4 text-t3" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
