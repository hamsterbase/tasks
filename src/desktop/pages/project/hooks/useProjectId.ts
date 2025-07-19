import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ITodoService } from '@/services/todo/common/todoService';
import { useParams } from 'react-router';

export const useProjectId = (): string => {
  const { projectUid } = useParams<{ projectUid?: string }>();
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  if (!projectUid) {
    return '';
  }

  const projectId = todoService.modelState.taskObjectUidMap.get(projectUid)?.id;
  return projectId || '';
};
