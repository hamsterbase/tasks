import { TaskInfo } from '@/core/state/type';
import { RecurringRule } from '@/core/type';
import { useService } from '@/hooks/use-service';
import { ITodoService } from '@/services/todo/common/todoService';

export const useTaskItemActions = (taskInfo: TaskInfo | null) => {
  const todoService = useService(ITodoService);

  const toggleTask = () => {
    if (!taskInfo) {
      return;
    }
    if (taskInfo.status !== 'created') {
      todoService.updateTask(taskInfo.id, { status: 'created' });
    } else {
      todoService.updateTask(taskInfo.id, { status: 'completed' });
    }
  };

  const updateTaskTitle = (title: string) => {
    if (!taskInfo) {
      return;
    }
    todoService.updateTask(taskInfo.id, { title });
  };

  const updateTaskNotes = (notes: string) => {
    if (!taskInfo) {
      return;
    }
    todoService.updateTask(taskInfo.id, { notes });
  };

  const clearStartDate = () => {
    if (!taskInfo) {
      return;
    }
    todoService.updateTask(taskInfo.id, { startDate: null });
  };

  const clearDueDate = () => {
    if (!taskInfo) {
      return;
    }
    todoService.updateTask(taskInfo.id, { dueDate: null });
  };

  const updateStartDate = (startDate: number | null) => {
    if (!taskInfo) {
      return;
    }
    todoService.updateTask(taskInfo.id, { startDate });
  };

  const updateDueDate = (dueDate: number | null) => {
    if (!taskInfo) {
      return;
    }
    todoService.updateTask(taskInfo.id, { dueDate });
  };

  const cancelTask = () => {
    if (!taskInfo) {
      return;
    }
    todoService.updateTask(taskInfo.id, { status: 'canceled' });
  };

  const updateRecurringRule = (recurringRule: RecurringRule | undefined) => {
    if (!taskInfo) {
      return;
    }
    todoService.updateTask(taskInfo.id, { recurringRule });
  };

  return {
    toggleTask,
    updateTaskTitle,
    updateTaskNotes,
    clearStartDate,
    clearDueDate,
    updateStartDate,
    updateDueDate,
    cancelTask,
    updateRecurringRule,
  };
};
