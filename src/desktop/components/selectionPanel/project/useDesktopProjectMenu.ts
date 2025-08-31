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
    return [
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
