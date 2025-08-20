import { getTodayTimestampInUtc } from '@/base/common/time';
import { InboxIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { calculateDragPosition } from '@/core/dnd/calculateDragPosition';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { DesktopPage } from '@/desktop/components/DesktopPage';
import { DragOverlayItem } from '@/desktop/components/drag/DragOverlayItem';
import { InboxTaskInput } from '@/desktop/components/inboxTaskInput/InboxTaskInput';
import { CreateTaskEvent } from '@/desktop/components/inboxTaskInput/InboxTaskInputController';
import { TaskListItem } from '@/desktop/components/todo/TaskListItem';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
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
import React, { useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';

export const Inbox = () => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  useWatchEvent(listService.onMainListChange);
  useWatchEvent(todoService.onStateChange);
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

  const { inboxTasks, willDisappearObjectIdSet } = getInboxTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    showFutureTasks,
    showCompletedTasks,
    showCompletedTasksAfter: completedAfter,
    keepAliveElements: todoService.keepAliveElements,
  });

  const inboxTaskIds = inboxTasks.map((task) => task.id);

  useEffect(() => {
    if (listService.mainList && listService.mainList.name === 'Inbox') {
      listService.mainList.updateItems(inboxTaskIds);
    } else {
      listService.setMainList(new TaskList('Inbox', inboxTaskIds, [], null, null));
    }
  }, [listService, inboxTaskIds]);

  const setFocus = useCallback(() => {
    listService.mainList?.setFocus(true);
  }, [listService]);

  const clearFocus = useCallback(() => {
    listService.mainList?.setFocus(false);
  }, [listService]);

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
      renderIcon={() => <InboxIcon className="size-6" />}
      title={localize('inbox', 'Inbox')}
      internalActions={{ displaySettings: { onOpen: (right, bottom) => openTaskDisplaySettings(right, bottom) } }}
    />
  );

  return (
    <DesktopPage header={header}>
      <InboxTaskInput
        onCreateTask={(event: CreateTaskEvent) => {
          todoService.addTask({
            title: event.title,
            position: {
              type: 'firstElement',
            },
          });
        }}
      />
      <div className="outline-none mt-5 pb-5" tabIndex={1} onFocus={setFocus} onBlur={clearFocus}>
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
      </div>
    </DesktopPage>
  );
};
