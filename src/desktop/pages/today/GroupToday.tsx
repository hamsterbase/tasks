import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { useDesktopDndSensors } from '@/base/hooks/useDesktopDndSensors';
import { FilterIcon, TodayIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { getProject } from '@/core/state/getProject';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { applyTodayGroupDragAction } from '@/core/state/today/applyTodayGroupDragAction';
import { getTodayGroupDragAction } from '@/core/state/today/getTodayGroupDragAction';
import { groupTodayItems } from '@/core/state/today/groupTodayItems';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { DesktopPage } from '@/desktop/components/DesktopPage';
import { DragOverlayItem } from '@/desktop/components/drag/DragOverlayItem';
import { TagFilterBar } from '@/desktop/components/filter/TagFilterBar';
import { useTagFilter } from '@/desktop/components/filter/useTagFilter';
import { InboxTaskInput } from '@/desktop/components/inboxTaskInput/InboxTaskInput';
import { ListContainer } from '@/desktop/components/listContainer/ListContainer';
import { SelectableProjectListItem } from '@/desktop/components/todo/SelectableProjectListItem';
import { TaskListItem } from '@/desktop/components/todo/TaskListItem';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { useTaskCommands } from '@/desktop/hooks/useTaskCommands';
import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useRegisterEvent } from '@/hooks/useRegisterEvent';
import { localize } from '@/nls';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import { TestIds } from '@/testIds';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TreeID } from 'loro-crdt';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { todayGroupCollisionDetectionStrategyFactory } from '@/core/state/today/todayGroupCollision';
import { getTodayGroupDropPosition } from '@/core/state/today/todayGroupDropPosition';
import { TodayGroupHeader } from '@/desktop/components/todo/TodayGroupHeader';

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

export const GroupToday = () => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  useWatchEvent(listService.onMainListChange);
  useWatchEvent(todoService.onStateChange);
  const { showCompletedTasks, openTaskDisplaySettings } = useDesktopTaskDisplaySettings('today', {
    hideShowFutureTasks: true,
  });
  const [allTags, setAllTags] = useState<string[]>([]);
  const tagFilter = useTagFilter(allTags);
  const sensors = useDesktopDndSensors();
  const dialog = useDesktopDialog();

  const todayItems = getTodayItems(
    todoService.modelState,
    getTodayTimestampInUtc(),
    {
      showCompletedTasks,
      showFutureTasks: false,
      currentDate: getTodayTimestampInUtc(),
      completedAfter: getTodayTimestampInUtc(),
      recentChangedTaskSet: new Set<TreeID>(todoService.keepAliveElements as TreeID[]),
    },
    tagFilter.currentTag
  );

  useEffect(() => {
    setAllTags((previousTags) => (isSameTags(previousTags, todayItems.allTags) ? previousTags : todayItems.allTags));
  }, [todayItems.allTags]);

  const grouped = groupTodayItems(todayItems.items, todoService.modelState);
  // The mainList itemIds must match the rendered (grouped) order so keyboard
  // navigation (ArrowDown / ArrowUp) walks items in the order users see them.
  const itemIds = grouped.groups.flatMap((group) =>
    group.items.map((item) => (item.type === 'project' ? item.project.id : item.task.id))
  );

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
        const focusAfterDelete = () => {
          if (event.focusItem) {
            listService.mainList?.select(event.focusItem, {
              multipleMode: false,
              offset: 99999,
              fireEditEvent: true,
            });
          }
        };
        const node = todoService.modelState.taskObjectMap.get(event.id);
        if (node?.type === 'project') {
          // Backspace on a project row would otherwise silently delete the
          // project (and all its tasks). Require an explicit confirmation —
          // pressing Backspace meaning "delete one task / step back" is a
          // common reflex we don't want to honour against a project.
          dialog({
            title: localize('task.delete_project_confirm_title', 'Delete Project'),
            description: localize(
              'task.delete_project_confirm_description',
              'Are you sure you want to delete this project? This action cannot be undone.'
            ),
            onConfirm: () => {
              flushSync(() => {
                todoService.deleteItem(event.id);
              });
              focusAfterDelete();
            },
          });
          break;
        }
        flushSync(() => {
          todoService.deleteItem(event.id);
        });
        focusAfterDelete();
        break;
      }
    }
  });

  useRegisterEvent(listService.mainList?.onCreateNewOne, (event) => {
    const afterId = event.afterId;
    if (!afterId) {
      return;
    }
    // The new task should be a sibling of the active row — same group, right
    // after the active row. Whether the active row is a task or a project,
    // the new task inherits the group's container (area / project / noParent).
    const containingGroup = grouped.groups.find((group) =>
      group.items.some((item) => (item.type === 'project' ? item.project.id : item.task.id) === afterId)
    );
    const inheritedParentId = (containingGroup?.parentId ?? undefined) as TreeID | undefined;
    const newTaskId = flushSync(() => {
      const newTask = todoService.addTask({
        title: '',
        startDate: getTodayTimestampInUtc(),
      });
      if (inheritedParentId) {
        todoService.updateTask(newTask, { parentId: inheritedParentId });
      }
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

  const mainList = listService.mainList;
  if (!mainList) {
    return null;
  }

  const projectIdSet = new Set<string>();
  const taskIdSet = new Set<string>();
  const headingIdSet = new Set<string>();
  const inProjectGroupIdSet = new Set<string>();
  grouped.groups.forEach((group) => {
    if (group.headingId) {
      headingIdSet.add(group.headingId);
      if (group.kind === 'project') {
        inProjectGroupIdSet.add(group.headingId);
      }
    }
    group.items.forEach((item) => {
      const id = item.type === 'project' ? (item.project.id as string) : (item.task.id as string);
      if (item.type === 'project') {
        projectIdSet.add(id);
      } else {
        taskIdSet.add(id);
      }
      if (group.kind === 'project') {
        inProjectGroupIdSet.add(id);
      }
    });
  });

  const sortableItems = grouped.groups.flatMap((group) => {
    const ids: string[] = group.headingId ? [group.headingId] : [];
    group.items.forEach((item) => {
      ids.push(item.type === 'project' ? (item.project.id as string) : (item.task.id as string));
    });
    return ids;
  });

  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    console.log('Drag ended. Active:', active.id, 'Over:', over.id);
    const position = getTodayGroupDropPosition(event);
    if (!position) return;
    console.log('Determined drop position:', position);
    const action = getTodayGroupDragAction(active.id as string, over.id as string, grouped, position);
    console.log('Determined drag action:', action);
    if (action) {
      applyTodayGroupDragAction(todoService, active.id as TreeID, action);
    }
  };

  const isTagFilterActive = tagFilter.currentTag.type !== 'all';
  return (
    <DesktopPage
      header={
        <EntityHeader
          renderIcon={() => <TodayIcon />}
          extraActions={[
            {
              icon: <FilterIcon strokeWidth={1.5} />,
              handleClick: tagFilter.clickFilter,
              title: localize('tasks.filterByTag', 'Filter by Tag'),
              testId: TestIds.EntityHeader.FilterToggleButton,
              isActive: tagFilter.isFilterOpen || isTagFilterActive,
            },
          ]}
          internalActions={{ displaySettings: { onOpen: (right, bottom) => openTaskDisplaySettings(right, bottom) } }}
          title={localize('today', 'Today')}
          titleDetail={
            tagFilter.isFilterOpen ? (
              <TagFilterBar tags={tagFilter.tags} selected={tagFilter.currentTag} onSelect={tagFilter.selectTag} />
            ) : null
          }
        />
      }
    >
      <DndContext
        sensors={sensors}
        collisionDetection={todayGroupCollisionDetectionStrategyFactory({
          isProject: (id) => projectIdSet.has(id),
          isTask: (id) => taskIdSet.has(id),
          isHeading: (id) => headingIdSet.has(id),
          isInProjectGroup: (id) => inProjectGroupIdSet.has(id),
        })}
        onDragEnd={handleGroupDragEnd}
      >
        <InboxTaskInput />
        <ListContainer taskList={mainList}>
          <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
            {grouped.groups.map((group) => (
              <div key={group.id}>
                {group.headingId &&
                  (() => {
                    let projectStatus;
                    let projectProgress;
                    if (group.kind === 'project' && group.parentId) {
                      const project = getProject(todoService.modelState, group.parentId);
                      projectStatus = project.status;
                      projectProgress = project.progress;
                    }
                    return (
                      <TodayGroupHeader
                        id={group.headingId}
                        title={group.title}
                        variant={group.kind === 'area' ? 'area' : 'project'}
                        projectStatus={projectStatus}
                        projectProgress={projectProgress}
                      />
                    );
                  })()}
                {group.items.map((item) => {
                  // Items are already nested under their parent's group header,
                  // so the parent name in the tag row would be redundant noise.
                  const hideParentInTags = group.kind !== 'noParent';
                  if (item.type === 'project') {
                    return (
                      <SelectableProjectListItem
                        key={item.project.id}
                        project={item.project}
                        taskList={mainList}
                        hideProjectTitle={hideParentInTags}
                      />
                    );
                  }
                  const willDisappear = todayItems.willDisappearObjectIdSet.has(item.task.id);
                  return (
                    <TaskListItem
                      taskList={mainList}
                      key={item.task.id}
                      task={item.task}
                      willDisappear={willDisappear}
                      hideProjectTitle={hideParentInTags}
                    />
                  );
                })}
              </div>
            ))}
          </SortableContext>
        </ListContainer>
        <DragOverlayItem projectVariant="desktop" />
      </DndContext>
    </DesktopPage>
  );
};
