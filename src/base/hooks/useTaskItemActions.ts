import { TaskInfo } from '@/core/state/type';
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

  return { toggleTask };
};
