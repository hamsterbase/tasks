import { TaskInfo } from '@/core/state/type';
import { DesktopMenuController, IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import { RecurringTaskSettingsController } from '@/desktop/overlay/recurringTaskSettings/RecurringTaskSettingsController';
import { useService } from '@/hooks/use-service.ts';
import { localize } from '@/nls.ts';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import type { TreeID } from 'loro-crdt';
import { IInstantiationService } from 'vscf/platform/instantiation/common.ts';

export const useTaskMenu = (taskId: TreeID, task: TaskInfo) => {
  const instantiationService = useService(IInstantiationService);
  const todoService = useService(ITodoService);

  const handleDeleteTask = () => {
    todoService.deleteItem(taskId);
  };

  const handleConvertToProject = () => {
    todoService.covertToProject(taskId);
  };

  const handleSetRecurringTask = () => {
    RecurringTaskSettingsController.create(
      task.recurringRule || {},
      (settings) => {
        todoService.updateTask(taskId, {
          recurringRule: settings,
        });
      },
      instantiationService
    );
  };

  function createMenuConfig(): IMenuConfig[] {
    return [
      {
        label: localize('task.convert_to_project', 'Convert to Project'),
        onSelect: handleConvertToProject,
      },
      {
        label: localize('task.set_recurring', 'Recurring Config'),
        onSelect: handleSetRecurringTask,
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
