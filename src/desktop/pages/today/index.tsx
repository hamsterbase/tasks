import { getTodayTimestampInUtc } from '@/base/common/time';
import { TodayIcon, TaskDisplaySettingsIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { calculateDragPosition } from '@/core/dnd/calculateDragPosition';
import { EntityHeader, EntityHeaderAction } from '@/desktop/components/common/EntityHeader';
import { DragOverlayItem } from '@/desktop/components/drag/DragOverlayItem';
import { DesktopProjectList } from '@/desktop/components/DesktopProjectList/DesktopProjectList';
import { InboxTaskInput } from '@/desktop/components/inboxTaskInput/InboxTaskInput';
import { CreateTaskEvent } from '@/desktop/components/inboxTaskInput/InboxTaskInputController';
import { TaskListItem } from '@/desktop/components/taskListItem/TaskListItem';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useRegisterEvent } from '@/hooks/useRegisterEvent';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
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

export const Today = () => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  useWatchEvent(listService.onMainListChange);
  useWatchEvent(todoService.onStateChange);
  const { showCompletedTasks } = useTaskDisplaySettings('today', {
    hideShowFutureTasks: true,
  });
  const { openTaskDisplaySettings } = useDesktopTaskDisplaySettings('today');

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

  const todayItems = getTodayItems(todoService.modelState, getTodayTimestampInUtc(), {
    showCompletedTasks,
    showFutureTasks: false,
    currentDate: getTodayTimestampInUtc(),
    completedAfter: getTodayTimestampInUtc(),
    recentChangedTaskSet: new Set<TreeID>(todoService.keepAliveElements as TreeID[]),
  });

  const items = todayItems.items;
  const projects = items.filter((item) => item.type === 'project');
  const tasks = items.filter((item) => item.type !== 'project');
  const itemIds = items.map((item) => item.id);

  useEffect(() => {
    if (listService.mainList && listService.mainList.name === 'Today') {
      listService.mainList.updateItems(itemIds);
    } else {
      listService.setMainList(new TaskList('Today', itemIds, [], null, null));
    }
  }, [listService, itemIds]);

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
        startDate: getTodayTimestampInUtc(),
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
      items.map((item) => item.id)
    );

    if (position) {
      todoService.moveDateAssignedList(active.id as TreeID, position);
    }
  };

  const handleOpenTaskDisplaySettings = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    openTaskDisplaySettings(rect.right, rect.bottom + 4);
  };

  const actions: EntityHeaderAction[] = [
    {
      icon: <TaskDisplaySettingsIcon className="size-4" />,
      handleClick: handleOpenTaskDisplaySettings,
      title: localize('today.taskDisplaySettings', 'Task Display Settings'),
    },
  ];

  const mainList = listService.mainList;
  if (!mainList) {
    return null;
  }

  return (
    <div className="h-full w-full bg-bg1">
      <div className="h-full flex flex-col">
        <EntityHeader
          renderIcon={() => <TodayIcon className="size-5 text-t2" />}
          title={localize('today', 'Today')}
          actions={actions}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto p-6 space-y-6">
            {projects.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-t2 uppercase tracking-wide">
                  {localize('today.projects', 'Projects')}
                </h2>
                <DesktopProjectList
                  projects={projects}
                  emptyStateLabel={localize('today.noProjects', 'No projects for today')}
                  useDateAssignedMove={true}
                />
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-sm font-medium text-t2 uppercase tracking-wide">
                {localize('today.tasks', 'Tasks')}
              </h2>
              <InboxTaskInput
                onCreateTask={(event: CreateTaskEvent) => {
                  todoService.addTask({
                    title: event.title,
                    startDate: getTodayTimestampInUtc(),
                    position: {
                      type: 'firstElement',
                    },
                  });
                }}
              />

              <div className="outline-none" tabIndex={1} onFocus={setFocus} onBlur={clearFocus}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => {
                      const willDisappear = todayItems.willDisappearObjectIdSet.has(task.id);
                      return (
                        <TaskListItem taskList={mainList} key={task.id} task={task} willDisappear={willDisappear} />
                      );
                    })}
                  </SortableContext>
                  <DragOverlayItem />
                </DndContext>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
