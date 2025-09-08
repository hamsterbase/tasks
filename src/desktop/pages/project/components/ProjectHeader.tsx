import { projectPageTitleInputId } from '@/components/edit/inputId';
import { projectTitleInputKey } from '@/components/edit/inputKeys';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox';
import { getProject } from '@/core/state/getProject';
import { ItemStatus } from '@/core/type';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { IEditService } from '@/services/edit/common/editService';
import { ITodoService } from '@/services/todo/common/todoService';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router';

interface ProjectHeaderProps {
  project: ReturnType<typeof getProject>;
  projectId: string;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, projectId }) => {
  const todoService = useService(ITodoService);
  const { openTaskDisplaySettings } = useDesktopTaskDisplaySettings(`project-${projectId}`);

  const dialog = useDesktopDialog();

  function updateTaskStatus(targetStatus: ItemStatus) {
    if (!project) return;
    const leftProject = project.totalTasks - project.completedTasks;
    if (leftProject === 0) {
      todoService.transitionProjectState({ projectId: project.id, projectStatus: targetStatus });
      return;
    }
    dialog({
      title: localize('project.status.toggle', 'Toggle Project Status'),
      description: localize(
        'project.toggle_status_description',
        'There are {0} tasks left, what do you want to do?',
        leftProject
      ),
      hideFooter: true,
      actions: [
        {
          type: 'button',
          key: 'as_completed',
          size: 'medium',
          variant: 'solid',
          color: 'primary',
          label: localize('tasks.mark_as_completed', 'Mark as Completed'),
          onclick: async () => {
            todoService.transitionProjectState({
              projectId: project.id,
              projectStatus: targetStatus,
              taskStatus: 'completed',
            });
          },
        },
        {
          type: 'button',
          key: 'as_canceled',
          size: 'medium',
          label: localize('tasks.mark_as_canceled', 'Mark as Canceled'),
          onclick: async () => {
            todoService.transitionProjectState({
              projectId: project.id,
              projectStatus: targetStatus,
              taskStatus: 'canceled',
            });
          },
        },
        {
          type: 'button',
          key: 'cancel',
          size: 'medium',
          label: localize('common.cancel', 'Cancel'),
          onclick: async () => {},
        },
      ],
    });
  }

  function handleToggleProjectStatus() {
    if (!project) return;
    switch (project.status) {
      case 'created': {
        updateTaskStatus('completed');
        break;
      }
      case 'canceled': {
        todoService.transitionProjectState({ projectId: project.id, projectStatus: 'created' });
        break;
      }
      case 'completed': {
        todoService.transitionProjectState({ projectId: project.id, projectStatus: 'created' });
        break;
      }
    }
  }

  const editService = useService(IEditService);
  const location = useLocation();
  const state = location.state as { focusInput?: string };
  useEffect(() => {
    if (state?.focusInput && !project.title) {
      editService.focusInput(state.focusInput);
    }
  }, [state?.focusInput, editService, project.title]);

  return (
    <EntityHeader
      editable
      inputKey={projectTitleInputKey(projectId)}
      inputId={projectPageTitleInputId(projectId)}
      renderIcon={() => (
        <ProjectStatusBox progress={project.progress} status={project.status} onClick={handleToggleProjectStatus} />
      )}
      title={project.title}
      placeholder={localize('project.untitled', 'New Project')}
      internalActions={{ displaySettings: { onOpen: openTaskDisplaySettings } }}
      onSave={(title) => {
        todoService.updateProject(project.id, { title });
      }}
    />
  );
};
