import { useDesktopDndSensors } from '@/base/hooks/useDesktopDndSensors';
import { TaskList } from '@/components/taskList/taskList';
import { calculateDragPosition } from '@/core/dnd/calculateDragPosition';
import { TaskInfo } from '@/core/state/type';
import { EmptyState } from '@/desktop/components/EmptyState';
import { DragOverlayItem } from '@/desktop/components/drag/DragOverlayItem';
import { ListContainer } from '@/desktop/components/listContainer/ListContainer';
import { TaskListItem } from '@/desktop/components/todo/TaskListItem';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useRegisterEvent } from '@/hooks/useRegisterEvent';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TreeID } from 'loro-crdt';
import React, { useEffect } from 'react';
import { flushSync } from 'react-dom';

interface TaskListSectionProps {
  tasks: TaskInfo[];
  willDisappearObjectIdSet: Set<string>;
  areaId: TreeID;
}

export const TaskListSection: React.FC<TaskListSectionProps> = ({ tasks, willDisappearObjectIdSet, areaId }) => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  const sensors = useDesktopDndSensors();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const position = calculateDragPosition(
      active.id as string,
      over.id as string,
      tasks.map((p) => p.id)
    );
    if (position) {
      todoService.updateTask(active.id as TreeID, {
        position,
      });
    }
  };

  useEffect(() => {
    const allTaskIds = tasks.map((task) => task.id);
    if (listService.mainList && listService.mainList.name === `Area-${areaId}`) {
      listService.mainList.updateItems(allTaskIds);
    } else {
      listService.setMainList(new TaskList(`Area-${areaId}`, allTaskIds, [], null, null));
    }
  }, [listService, areaId, tasks]);

  const taskList = listService.mainList;

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
    const newTaskId = flushSync(() => {
      return todoService.addTask({
        title: '',
        position: {
          type: 'afterElement',
          previousElementId: afterId,
        },
      });
    });
    listService.mainList?.select(newTaskId, {
      multipleMode: false,
      offset: 0,
      fireEditEvent: true,
    });
  });

  if (tasks.length === 0 || !taskList) {
    return <EmptyState label="No tasks yet" />;
  }

  return (
    <ListContainer taskList={taskList}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className={desktopStyles.TaskListSectionItemsContainer}>
            {tasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                taskList={taskList}
                hideProjectTitle
                willDisappear={willDisappearObjectIdSet.has(task.id)}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlayItem />
      </DndContext>
    </ListContainer>
  );
};
