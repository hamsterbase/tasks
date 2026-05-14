import { FilterIcon } from '@/components/icons';
import { projectPageTitleInputId } from '@/components/edit/inputId';
import { projectTitleInputKey } from '@/components/edit/inputKeys';
import { getProject } from '@/core/state/getProject';
import { ItemStatus } from '@/core/type';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { ProjectIcon } from '@/desktop/components/todo/ProjectIcon';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { IEditService } from '@/services/edit/common/editService';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TagFilter } from '@/desktop/components/filter/tagFilter';
import { TestIds } from '@/testIds';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { TagFilterBar } from '@/desktop/components/filter/TagFilterBar';

interface ProjectHeaderProps {
  project: ReturnType<typeof getProject>;
  projectId: string;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  availableTags: string[];
  tagFilter: TagFilter;
  onSelectTagFilter: (next: TagFilter) => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  projectId,
  isFilterOpen,
  onToggleFilter,
  availableTags,
  tagFilter,
  onSelectTagFilter,
}) => {
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
      renderIcon={() => <ProjectIcon progress={project.progress} status={project.status} size="md" />}
      onIconClick={handleToggleProjectStatus}
      title={project.title}
      placeholder={localize('project.untitled', 'New Project')}
      extraActions={[
        {
          icon: <FilterIcon strokeWidth={1.5} />,
          handleClick: onToggleFilter,
          title: localize('tasks.filterByTag', 'Filter by Tag'),
          testId: TestIds.EntityHeader.FilterToggleButton,
          isActive: isFilterOpen || tagFilter.type !== 'all',
        },
      ]}
      internalActions={{
        displaySettings: { onOpen: openTaskDisplaySettings },
      }}
      titleDetail={
        isFilterOpen ? <TagFilterBar tags={availableTags} selected={tagFilter} onSelect={onSelectTagFilter} /> : null
      }
      onSave={(title) => {
        todoService.updateProject(project.id, { title });
      }}
    />
  );
};
