import { DesktopMenuController, IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import { useService } from '@/hooks/use-service.ts';
import { localize } from '@/nls.ts';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import type { TreeID } from 'loro-crdt';
import { IInstantiationService } from 'vscf/platform/instantiation/common.ts';

export const useDesktopProjectMenu = (taskId: TreeID) => {
  const instantiationService = useService(IInstantiationService);
  const todoService = useService(ITodoService);

  const handleDeleteProject = () => {
    todoService.deleteItem(taskId);
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
