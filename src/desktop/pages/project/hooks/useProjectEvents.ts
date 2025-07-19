import { useService } from '@/hooks/use-service';
import { useRegisterEvent } from '@/hooks/useRegisterEvent';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import { flushSync } from 'react-dom';

export const useProjectEvents = () => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);

  useRegisterEvent(listService.mainList?.onListOperation, (event) => {
    switch (event.type) {
      case 'delete_item': {
        flushSync(() => {
          todoService.deleteItem(event.id);
        });
        if (event.focusItem) {
          listService.mainList?.select(event.focusItem, {
            multipleMode: false,
            offset: 99999,
            fireEditEvent: true,
          });
        }
        break;
      }
    }
  });

  useRegisterEvent(listService.mainList?.onCreateNewOne, (event) => {
    const afterId = event.afterId;
    if (!afterId) {
      return;
    }

    let newTaskId = null;
    const taskObject = todoService.modelState.taskObjectMap.get(afterId);

    if (taskObject?.type === 'projectHeading') {
      newTaskId = flushSync(() => {
        return todoService.addTask({
          title: '',
          position: {
            type: 'firstElement',
            parentId: afterId,
          },
        });
      });
    } else if (taskObject?.type === 'task') {
      newTaskId = flushSync(() => {
        return todoService.addTask({
          title: '',
          position: {
            type: 'afterElement',
            previousElementId: afterId,
          },
        });
      });
    }

    if (newTaskId) {
      listService.mainList?.select(newTaskId, {
        multipleMode: false,
        offset: 0,
        fireEditEvent: true,
      });
    }
  });
};
