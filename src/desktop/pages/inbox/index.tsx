import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { InboxIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { calculateDragPosition } from '@/core/dnd/calculateDragPosition';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { DesktopPage } from '@/desktop/components/DesktopPage';
import { DragOverlayItem } from '@/desktop/components/drag/DragOverlayItem';
import { InboxTaskInput } from '@/desktop/components/inboxTaskInput/InboxTaskInput';
import { ListContainer } from '@/desktop/components/listContainer/ListContainer';
import { TaskListItem } from '@/desktop/components/todo/TaskListItem';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { useScrollToTask } from '@/desktop/hooks/useScrollToTask';
import { useTaskCommands } from '@/desktop/hooks/useTaskCommands';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useRegisterEvent } from '@/hooks/useRegisterEvent';
import { localize } from '@/nls';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TreeID } from 'loro-crdt';
import React, { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useLocation } from 'react-router';

export const Inbox = () => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  const location = useLocation();
  useWatchEvent(listService.onMainListChange);
  useWatchEvent(todoService.onStateChange);
  useScrollToTask();
  const { openTaskDisplaySettings, showCompletedTasks, completedAfter, showFutureTasks } =
    useDesktopTaskDisplaySettings('inbox');

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const state = location.state as { highlightTaskId?: string };
  const highlightTaskId = state?.highlightTaskId;

  const keepAliveElements = [...todoService.keepAliveElements];
  if (highlightTaskId && !keepAliveElements.includes(highlightTaskId)) {
    keepAliveElements.push(highlightTaskId);
  }

  const { inboxTasks, willDisappearObjectIdSet } = getInboxTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    showFutureTasks,
    showCompletedTasks,
    showCompletedTasksAfter: completedAfter,
    keepAliveElements,
  });

  const inboxTaskIds = inboxTasks.map((task) => task.id);

  useEffect(() => {
    if (listService.mainList && listService.mainList.name === 'Inbox') {
      listService.mainList.updateItems(inboxTaskIds);
    } else {
      listService.setMainList(new TaskList('Inbox', inboxTaskIds, [], null, null));
    }
  }, [listService, inboxTaskIds]);

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

  useTaskCommands({ createTask: {}, setStartDateToToday: true });

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const position = calculateDragPosition(
      active.id as string,
      over.id as string,
      inboxTasks.map((task) => task.id)
    );

    if (position) {
      todoService.updateTask(active.id as TreeID, {
        position,
      });
    }
  };

  const mainList = listService.mainList;
  if (!mainList) {
    return null;
  }

  const header = (
    <EntityHeader
      renderIcon={() => <InboxIcon />}
      title={localize('inbox', 'Inbox')}
      internalActions={{ displaySettings: { onOpen: (right, bottom) => openTaskDisplaySettings(right, bottom) } }}
    />
  );

  return (
    <DesktopPage header={header}>
      <InboxTaskInput />
      <ListContainer taskList={listService.mainList}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={inboxTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            {inboxTasks.map((task) => (
              <TaskListItem
                taskList={mainList}
                key={task.id}
                task={task}
                willDisappear={willDisappearObjectIdSet.has(task.id)}
              />
            ))}
          </SortableContext>
          <DragOverlayItem />
        </DndContext>
      </ListContainer>
    </DesktopPage>
  );
};
