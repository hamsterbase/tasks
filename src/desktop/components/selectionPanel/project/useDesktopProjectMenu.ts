import { getProject } from '@/core/state/getProject';
import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { DesktopMenuController, IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import { useService } from '@/hooks/use-service.ts';
import { localize } from '@/nls.ts';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import type { TreeID } from 'loro-crdt';
import { useNavigate } from 'react-router';
import { IInstantiationService } from 'vscf/platform/instantiation/common.ts';

export const useDesktopProjectMenu = (taskId: TreeID) => {
  const instantiationService = useService(IInstantiationService);
  const todoService = useService(ITodoService);
  const navigate = useNavigate();
  const dialog = useDesktopDialog();

  const handleCancelProject = () => {
    const project = getProject(todoService.modelState, taskId);
    if (!project) return;

    if (project.status === 'canceled') return;

    const leftProject = project.totalTasks - project.completedTasks;

    if (leftProject === 0) {
      todoService.transitionProjectState({ projectId: taskId, projectStatus: 'canceled' });
      return;
    }

    dialog({
      title: localize('project.cancel_project', 'Cancel Project'),
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
              projectId: taskId,
              projectStatus: 'canceled',
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
              projectId: taskId,
              projectStatus: 'canceled',
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
  };

  const handleDeleteProject = () => {
    dialog({
      title: localize('task.delete_project_confirm_title', 'Delete Project'),
      description: localize(
        'task.delete_project_confirm_description',
        'Are you sure you want to delete this project? This action cannot be undone.'
      ),
      onConfirm: () => {
        todoService.deleteItem(taskId);
        navigate('/desktop/inbox');
      },
    });
  };

  function createMenuConfig(): IMenuConfig[] {
    const project = getProject(todoService.modelState, taskId);
    return [
      {
        label: localize('project.cancel_project', 'Cancel Project'),
        onSelect: handleCancelProject,
        disabled: project?.status === 'canceled',
      },
      {
        label: localize('task.delete_project', 'Delete Project'),
        onSelect: handleDeleteProject,
      },
    ];
  }

  function openDesktopProjectMenu(x: number, y: number) {
    const menuConfig = createMenuConfig();
    DesktopMenuController.create(
      {
        menuConfig,
        x,
        y,
      },
      instantiationService
    );
  }

  return {
    openDesktopProjectMenu: openDesktopProjectMenu,
  };
};
