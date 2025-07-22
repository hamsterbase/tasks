import { projectPageTitleInputId } from '@/components/edit/inputId';
import { projectTitleInputKey } from '@/components/edit/inputKeys';
import { HeadingIcon, TaskDisplaySettingsIcon } from '@/components/icons';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox';
import { getProject } from '@/core/state/getProject';
import { EntityHeader, EntityHeaderAction } from '@/desktop/components/common/EntityHeader';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { useService } from '@/hooks/use-service';
import useProject from '@/hooks/useProject';
import { localize } from '@/nls';
import { IEditService } from '@/services/edit/common/editService';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import React, { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useLocation } from 'react-router';

interface ProjectHeaderProps {
  project: ReturnType<typeof getProject>;
  projectId: string;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, projectId }) => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  const { openTaskDisplaySettings } = useDesktopTaskDisplaySettings(`project-${projectId}`);
  const { handleToggleProjectStatus } = useProject(project);

  const editService = useService(IEditService);
  const location = useLocation();
  const state = location.state as { focusInput?: string };
  useEffect(() => {
    if (state?.focusInput && !project.title) {
      editService.focusInput(state.focusInput);
    }
  }, [state?.focusInput, editService]);

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

  const actions: EntityHeaderAction[] = [
    {
      icon: (
        <div className="relative">
          <HeadingIcon className="size-4" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full flex items-center justify-center">
            <span className="text-t3 text-xs leading-none">+</span>
          </div>
        </div>
      ),
      handleClick: handleAddHeading,
      title: localize('project.addHeading', 'Add Heading'),
      className:
        'relative flex items-center px-3 py-1.5 text-sm text-t2 hover:text-t1 hover:bg-bg2 rounded-md transition-colors',
    },
    {
      icon: <TaskDisplaySettingsIcon className="size-4" />,
      handleClick: handleOpenTaskDisplaySettings,
      title: localize('project.taskDisplaySettings', 'Task Display Settings'),
    },
  ];

  return (
    <EntityHeader
      editable
      inputKey={projectTitleInputKey(projectId)}
      inputId={projectPageTitleInputId(projectId)}
      renderIcon={() => (
        <button className="flex items-center justify-center" onClick={handleToggleProjectStatus}>
          <ProjectStatusBox progress={project.progress} status={project.status} className="size-5" />
        </button>
      )}
      title={project.title}
      placeholder={localize('project.untitled', 'New Project')}
      actions={actions}
      onSave={(title) => {
        todoService.updateProject(project.id, { title });
      }}
    />
  );
};
