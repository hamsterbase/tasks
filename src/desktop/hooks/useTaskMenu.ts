import { DesktopMenuController, IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import { IInstantiationService } from 'vscf/platform/instantiation/common.ts';
import { useService } from '@/hooks/use-service.ts';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { localize } from '@/nls.ts';
import type { TreeID } from 'loro-crdt';

export const useTaskMenu = (taskId: TreeID) => {
  const instantiationService = useService(IInstantiationService);
  const todoService = useService(ITodoService);

  const handleDeleteTask = () => {
    todoService.deleteItem(taskId);
  };

  const handleConvertToProject = () => {
    todoService.covertToProject(taskId);
  };

  function createMenuConfig(): IMenuConfig[] {
    return [
      {
        label: localize('task.convert_to_project', 'Convert to Project'),
        onSelect: handleConvertToProject,
      },
      {
        label: localize('task.delete_task', 'Delete Task'),
        onSelect: handleDeleteTask,
      },
    ];
  }

  function openTaskMenu(x: number, y: number) {
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
    openTaskMenu,
  };
};
