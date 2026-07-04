import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { TaskDisplaySettingsIcon, TodayIcon } from '@/components/icons';
import { getProject } from '@/core/state/getProject';
import { applyTodayGroupDragAction } from '@/core/state/today/applyTodayGroupDragAction';
import { getTodayGroupDragAction } from '@/core/state/today/getTodayGroupDragAction';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { GroupedTodayItems, groupTodayItems, TodayGroupItem } from '@/core/state/today/groupTodayItems';
import { todayGroupCollisionDetectionStrategyFactory } from '@/core/state/today/todayGroupCollision';
import { getTodayGroupDropPosition } from '@/core/state/today/todayGroupDropPosition';
import { formatTodayTitle } from '@/core/time/formatTodayTitle';
import { ItemMovePosition } from '@/core/type';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { DragEndEvent, useDndContext } from '@dnd-kit/core';
import { arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import type { TreeID } from 'loro-crdt';
import React, { useEffect } from 'react';
import { useMobileTagFilter } from '../../components/filter/useMobileTagFilter';
import { PageLayout } from '../../components/PageLayout';
import TaskItemWrapper from '../../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../../components/todo/HomeProjectItem';
import { TaskItem } from '../../components/todo/TaskItem';
import { TodayGroupHeader } from '../../components/todo/TodayGroupHeader';
import { useTaskDisplaySettingsMobile } from '../../hooks/useTaskDisplaySettings';
import { styles } from '../../theme';

function groupItemId(item: TodayGroupItem): TreeID {
  return item.type === 'project' ? item.project.id : item.task.id;
}

/**
 * Compute which rows carry the card's top/bottom rounding. Walks `order` (the
 * flat sortable order), splitting clusters at heading ids: the first row of a
 * cluster is top-rounded, the last is bottom-rounded. Ids in `skip` (inert
 * markers like last-placement) are ignored.
 */
function computeRowRounding(order: string[], headingIds: Set<string>, skip: Set<string>) {
  const top = new Set<string>();
  const bottom = new Set<string>();
  let clusterStart = true;
  let lastRow: string | null = null;
  for (const id of order) {
    if (skip.has(id)) continue;
    if (headingIds.has(id)) {
      if (lastRow) bottom.add(lastRow);
      clusterStart = true;
      lastRow = null;
      continue;
    }
    if (clusterStart) {
      top.add(id);
      clusterStart = false;
    }
    lastRow = id;
  }
  if (lastRow) bottom.add(lastRow);
  return { top, bottom };
}

interface GroupTodayListProps {
  grouped: GroupedTodayItems;
  sortableItems: string[];
  headingIdSet: Set<string>;
  willDisappearObjectIdSet: Set<TreeID>;
}

const GroupTodayList: React.FC<GroupTodayListProps> = ({
  grouped,
  sortableItems,
  headingIdSet,
  willDisappearObjectIdSet,
}) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const { active, over } = useDndContext();

  // The card background lives on each row (not on a group container) so it
  // travels with the row while dnd-kit reflows rows across group boundaries
  // during a drag. Rounding therefore has to follow the PROJECTED order (the
  // positions rows are displaced to while dragging), not the static grouping —
  // e.g. dragging a group's first row away must hand its top rounding to the
  // row sliding up to replace it.
  const activeId = active?.id as string | undefined;
  const overId = over?.id as string | undefined;
  let projectedOrder = sortableItems;
  if (activeId && overId && activeId !== overId) {
    const from = sortableItems.indexOf(activeId);
    const to = sortableItems.indexOf(overId);
    if (from !== -1 && to !== -1) {
      projectedOrder = arrayMove(sortableItems, from, to);
    }
  }
  const skip = new Set([DragDropElements.lastPlacement, DragDropElements.create]);
  // The lifted row leaves its card the moment it floats: its semi-transparent
  // slot is not a card row, so the rows around it re-derive their rounding
  // without it. Group headings stay visible in the flow while dragged, so
  // they keep splitting clusters.
  if (activeId && !headingIdSet.has(activeId)) {
    skip.add(activeId);
  }
  const rounding = computeRowRounding(projectedOrder, headingIdSet, skip);

  return (
    <div>
      {grouped.groups.map((group) => {
        // Items are already nested under their parent's group header, so the
        // parent name in the row subtitle would be redundant noise.
        const hideParentInRow = group.kind !== 'noParent';
        let projectStatus;
        let projectProgress;
        if (group.kind === 'project' && group.parentId) {
          const project = getProject(todoService.modelState, group.parentId);
          projectStatus = project.status;
          projectProgress = project.progress;
        }
        return (
          <React.Fragment key={group.id}>
            {group.headingId && (
              <TodayGroupHeader
                id={group.headingId}
                title={group.title}
                variant={group.kind === 'area' ? 'area' : 'project'}
                projectStatus={projectStatus}
                projectProgress={projectProgress}
              />
            )}
            {group.items.map((item) => {
              const id = groupItemId(item) as string;
              const rowClassName = classNames(styles.taskItemGroupBackground, {
                [styles.taskItemGroupTopRound]: rounding.top.has(id),
                [styles.taskItemGroupBottomRound]: rounding.bottom.has(id),
              });
              if (item.type === 'project') {
                return (
                  <HomeProjectItem
                    key={item.project.id}
                    projectInfo={item.project}
                    hideSubtitle={hideParentInRow}
                    className={rowClassName}
                  />
                );
              }
              const willDisappear = willDisappearObjectIdSet.has(item.task.id);
              return (
                <TaskItemWrapper key={item.task.id} willDisappear={willDisappear} id={item.task.id}>
                  <TaskItem taskInfo={item.task} hideProjectTitle={hideParentInRow} className={rowClassName} />
                </TaskItemWrapper>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const GroupToday = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const { showCompletedTasks, openTaskDisplaySettings } = useTaskDisplaySettingsMobile('today', {
    hideShowFutureTasks: true,
  });

  const tagFilter = useMobileTagFilter();
  const { observeTags } = tagFilter;

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
    tagFilter.value
  );

  useEffect(() => {
    observeTags(todayItems.allTags);
  }, [todayItems.allTags, observeTags]);

  const grouped = groupTodayItems(todayItems.items, todoService.modelState);

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
      const id = groupItemId(item) as string;
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

  const sortableItems: string[] = grouped.groups
    .flatMap((group) => {
      const ids: string[] = group.headingId ? [group.headingId] : [];
      group.items.forEach((item) => {
        ids.push(groupItemId(item) as string);
      });
      return ids;
    })
    .concat([DragDropElements.lastPlacement, DragDropElements.create]);

  const handleCreateTask = (options: { position?: ItemMovePosition; parentId?: TreeID | null }) => {
    const taskId = todoService.addTask({
      title: '',
      startDate: getTodayTimestampInUtc(),
      position: {
        type: 'firstElement',
      },
    });
    if (options.parentId) {
      todoService.updateTask(taskId, { parentId: options.parentId });
    }
    if (options.position) {
      todoService.moveDateAssignedList(taskId, options.position);
    }
    setTimeout(() => {
      todoService.editItem(taskId);
    }, 100);
  };

  // The FAB only collides with task rows and the last-placement marker (see
  // todayGroupCollisionDetectionStrategyFactory), so the drop target is either
  // a task — create right above it, inside its group — or the end of the list.
  const handleCreateDragEnd = (overId: string) => {
    if (overId === DragDropElements.lastPlacement) {
      const lastGroup = grouped.groups[grouped.groups.length - 1];
      const lastItem = lastGroup?.items[lastGroup.items.length - 1];
      if (!lastItem) {
        handleCreateTask({});
        return;
      }
      handleCreateTask({
        position: { type: 'afterElement', previousElementId: groupItemId(lastItem) },
        parentId: lastGroup.parentId,
      });
      return;
    }
    const overGroup = grouped.groups.find((group) =>
      group.items.some((item) => (groupItemId(item) as string) === overId)
    );
    if (!overGroup) {
      return;
    }
    handleCreateTask({
      position: { type: 'beforeElement', nextElementId: overId as TreeID },
      parentId: overGroup.parentId,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = event.active.id as string;
    const overId = event.over?.id as string;
    if (!activeId || !overId) return;
    if (activeId === DragDropElements.create) {
      handleCreateDragEnd(overId);
      return;
    }
    const position = getTodayGroupDropPosition(event);
    if (!position) return;
    const action = getTodayGroupDragAction(activeId, overId, grouped, position);
    if (action) {
      applyTodayGroupDragAction(todoService, activeId as TreeID, action);
    }
  };

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'today',
        title: `${localize('today', 'Today')} (${formatTodayTitle()})`,
        renderIcon: (className: string) => <TodayIcon className={className} />,
        actions: [
          tagFilter.headerAction,
          {
            icon: <TaskDisplaySettingsIcon className={styles.headerActionButtonIcon} strokeWidth={1.5} />,
            onClick: openTaskDisplaySettings,
          },
        ],
      }}
      dragOption={{
        // The dragged row's group context is obvious from where it hovers, so
        // the parent name in the overlay would be redundant noise.
        overlayItem: {
          textProps: { hideProjectTitle: true },
          projectProps: { hideSubtitle: true },
        },
        collisionDetection: todayGroupCollisionDetectionStrategyFactory({
          isProject: (id) => projectIdSet.has(id),
          isTask: (id) => taskIdSet.has(id),
          isHeading: (id) => headingIdSet.has(id),
          isInProjectGroup: (id) => inProjectGroupIdSet.has(id),
        }),
        sortable: {
          items: sortableItems,
          strategy: verticalListSortingStrategy,
          lastPlacement: true,
        },
        onDragEnd: handleDragEnd,
      }}
      onFabClick={() => handleCreateTask({})}
    >
      {tagFilter.filterBar}
      <GroupTodayList
        grouped={grouped}
        sortableItems={sortableItems}
        headingIdSet={headingIdSet}
        willDisappearObjectIdSet={todayItems.willDisappearObjectIdSet}
      />
    </PageLayout>
  );
};
