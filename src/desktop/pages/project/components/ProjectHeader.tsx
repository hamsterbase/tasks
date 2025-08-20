import { projectPageTitleInputId } from '@/components/edit/inputId';
import { projectTitleInputKey } from '@/components/edit/inputKeys';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox';
import { getProject } from '@/core/state/getProject';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { useService } from '@/hooks/use-service';
import useProject from '@/hooks/useProject';
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
  const { handleToggleProjectStatus } = useProject(project);

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
        <ProjectStatusBox
          progress={project.progress}
          status={project.status}
          className="size-5"
          onClick={handleToggleProjectStatus}
        />
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
