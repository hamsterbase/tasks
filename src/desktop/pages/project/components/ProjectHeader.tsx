import { HeadingIcon, TaskDisplaySettingsIcon } from '@/components/icons';
import { ProjectStatusIcon } from '@/desktop/components/sidebar/ProjectStatusIcon';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { useService } from '@/hooks/use-service';
import useProject from '@/hooks/useProject';
import { localize } from '@/nls';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import { getProject } from '@/core/state/getProject';
import React from 'react';
import { flushSync } from 'react-dom';

interface ProjectHeaderProps {
  project: ReturnType<typeof getProject>;
  projectId: string;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, projectId }) => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  const { openTaskDisplaySettings } = useDesktopTaskDisplaySettings(`project-${projectId}`);
  const { handleToggleProjectStatus } = useProject(project);

  const handleAddHeading = () => {
    const headingId = flushSync(() => {
      return todoService.addProjectHeading({
        title: '',
        position: {
          type: 'firstElement',
          parentId: project.id,
        },
      });
    });
    
    if (headingId) {
      listService.mainList?.select(headingId, {
        multipleMode: false,
        offset: 0,
        fireEditEvent: true,
      });
    }
  };

  const handleOpenTaskDisplaySettings = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    openTaskDisplaySettings(rect.right, rect.bottom + 4);
  };

  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-line-light bg-bg1">
      <div className="flex items-center gap-3">
        <button className="flex items-center justify-center" onClick={handleToggleProjectStatus}>
          <ProjectStatusIcon progress={project.progress} status={project.status} />
        </button>
        <h1 className="text-lg font-medium text-t1">
          {project.title || localize('project.untitled', 'New Project')}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="relative flex items-center px-3 py-1.5 text-sm text-t2 hover:text-t1 hover:bg-bg2 rounded-md transition-colors"
          title={localize('project.addHeading', 'Add Heading')}
          onClick={handleAddHeading}
        >
          <div className="relative">
            <HeadingIcon className="size-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full flex items-center justify-center">
              <span className="text-t3 text-xs leading-none">+</span>
            </div>
          </div>
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-t2 hover:text-t1 hover:bg-bg2 rounded-md transition-colors"
          title={localize('project.taskDisplaySettings', 'Task Display Settings')}
          onClick={handleOpenTaskDisplaySettings}
        >
          <TaskDisplaySettingsIcon className="size-4" />
        </button>
      </div>
    </div>
  );
};