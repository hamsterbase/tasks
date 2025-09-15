import { getTodayTimestampInUtc } from '@/base/common/time';
import { projectPageTitleInputId } from '@/components/edit/inputId';
import { ItemPosition } from '@/core/type';
import { useService } from '@/hooks/use-service';
import { useRegisterEvent } from '@/hooks/useRegisterEvent';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';

interface UseTaskCommands {
  createTask?: {
    startDate?: number;
    position?: ItemPosition;
  };
  createProject?: {
    position: ItemPosition;
  };
  createHeader?: {
    position: ItemPosition;
  };
  setStartDateToToday?: boolean;
}

export const useTaskCommands = (options: UseTaskCommands) => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  const navigate = useNavigate();
  useRegisterEvent(todoService.onTaskCommands, (e) => {
    switch (e.type) {
      case 'createTask': {
        if (!options.createTask) return;
        const newTaskId = flushSync(() => {
          return todoService.addTask({
            title: e.title || '',
            startDate: options.createTask?.startDate,
            position: options.createTask?.position ?? {
              type: 'firstElement',
            },
          });
        });
        if (e.disableAutoFocus) return;
        listService.mainList?.select(newTaskId, {
          multipleMode: false,
          offset: 0,
          fireEditEvent: true,
        });
        break;
      }
      case 'createProject': {
        if (!options.createProject) return;
        const projectId = flushSync(() => {
          return todoService.addProject({
            title: '',
            position: options.createProject?.position ?? { type: 'firstElement' },
          });
        });
        if (projectId) {
          const projectUid = todoService.modelState.taskObjectMap.get(projectId)?.uid;
          if (projectUid) {
            navigate(`/desktop/project/${projectUid}`, {
              state: {
                focusInput: projectPageTitleInputId(projectId),
              },
            });
          }
        }
        break;
      }
      case 'createHeader': {
        if (!options.createHeader) return;
        const headerId = flushSync(() => {
          return todoService.addProjectHeading({
            title: '',
            position: options.createHeader?.position ?? { type: 'firstElement' },
          });
        });
        if (headerId) {
          listService.mainList?.select(headerId, {
            multipleMode: false,
            offset: 0,
            fireEditEvent: true,
          });
        }
        break;
      }
      case 'setStartDateToToday': {
        if (!options.setStartDateToToday) return;
        const mainList = listService.mainList;
        if (mainList && mainList.isFocused) {
          const selectedIds = mainList.selectedIds;
          selectedIds.forEach((id) => {
            const taskObject = todoService.modelState.taskObjectMap.get(id);
            if (taskObject) {
              if (taskObject.type === 'task') {
                todoService.updateTask(id, { startDate: getTodayTimestampInUtc() });
              } else if (taskObject.type === 'project') {
                todoService.updateProject(id, { startDate: getTodayTimestampInUtc() });
              }
            }
          });
        }
      }
    }
  });
};
