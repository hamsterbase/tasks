import { getTodayTimestampInUtc } from '@/base/common/time';
import { useDesktopDndSensors } from '@/base/hooks/useDesktopDndSensors';
import { TodayIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { calculateDragPosition } from '@/core/dnd/calculateDragPosition';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { DesktopPage } from '@/desktop/components/DesktopPage';
import { DesktopProjectList } from '@/desktop/components/DesktopProjectList/DesktopProjectList';
import { DragOverlayItem } from '@/desktop/components/drag/DragOverlayItem';
import { InboxTaskInput } from '@/desktop/components/inboxTaskInput/InboxTaskInput';
import { ListContainer } from '@/desktop/components/listContainer/ListContainer';
import { TitleContentSection } from '@/desktop/components/TitleContentSection';
import { TaskListItem } from '@/desktop/components/todo/TaskListItem';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { useTaskCommands } from '@/desktop/hooks/useTaskCommands';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useRegisterEvent } from '@/hooks/useRegisterEvent';
import { localize } from '@/nls';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TreeID } from 'loro-crdt';
import React, { useEffect } from 'react';
import { flushSync } from 'react-dom';

export const Today = () => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  useWatchEvent(listService.onMainListChange);
  useWatchEvent(todoService.onStateChange);
  const { showCompletedTasks, openTaskDisplaySettings } = useDesktopTaskDisplaySettings('today', {
    hideShowFutureTasks: true,
  });

  const sensors = useDesktopDndSensors();
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
      const newTask = todoService.addTask({
        title: '',
        startDate: getTodayTimestampInUtc(),
      });
      todoService.moveDateAssignedList(newTask, { previousElementId: afterId, type: 'afterElement' });
      return newTask;
    });
    listService.mainList?.select(newTaskId, {
      multipleMode: false,
      offset: 0,
      fireEditEvent: true,
    });
  });

  useTaskCommands({ createTask: { startDate: getTodayTimestampInUtc() } });

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

  const mainList = listService.mainList;
  if (!mainList) {
    return null;
  }

  return (
    <DesktopPage
      header={
        <EntityHeader
          renderIcon={() => <TodayIcon />}
          internalActions={{ displaySettings: { onOpen: (right, bottom) => openTaskDisplaySettings(right, bottom) } }}
          title={localize('today', 'Today')}
        />
      }
    >
      <TitleContentSection title={localize('today.projects', 'Projects')}>
        <DesktopProjectList
          projects={projects}
          emptyStateLabel={localize('today.noProjects', 'No projects for today')}
          useDateAssignedMove={true}
        />
      </TitleContentSection>
      <TitleContentSection title={localize('today.tasks', 'Tasks')}>
        <InboxTaskInput />
        <ListContainer taskList={mainList}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => {
                const willDisappear = todayItems.willDisappearObjectIdSet.has(task.id);
                return <TaskListItem taskList={mainList} key={task.id} task={task} willDisappear={willDisappear} />;
              })}
            </SortableContext>
            <DragOverlayItem />
          </DndContext>
        </ListContainer>
      </TitleContentSection>
    </DesktopPage>
  );
};
