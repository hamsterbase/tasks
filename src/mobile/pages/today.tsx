import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { TaskDisplaySettingsIcon, TodayIcon } from '@/components/icons';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useConfig } from '@/hooks/useConfig';
import { localize } from '@/nls';
import { groupTodayByAreaProjectConfigKey } from '@/services/config/config';
import { ITodoService } from '@/services/todo/common/todoService';
import { computeSectionRounding } from '@/mobile/components/dnd/projectedRounding';
import { calculateDragDropAction } from '@/utils/dnd/calculateDragDropAction';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { singleListCollisionDetectionStrategy } from '@/utils/dnd/singleListCollisionDetectionStrategy';
import { DragEndEvent, useDndContext } from '@dnd-kit/core';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import { formatTodayTitle } from '@/core/time/formatTodayTitle';
import type { TreeID } from 'loro-crdt';
import React, { useEffect } from 'react';
import { useMobileTagFilter } from '../components/filter/useMobileTagFilter';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../components/todo/HomeProjectItem';
import { TaskItem } from '../components/todo/TaskItem';
import { styles } from '../theme';
import { useTaskDisplaySettingsMobile } from '../hooks/useTaskDisplaySettings';
import { ItemPosition } from '@/core/type';
import { GroupToday } from './today/GroupToday';

interface FlatTodayListProps {
  items: ReturnType<typeof getTodayItems>['items'];
  willDisappearObjectIdSet: Set<TreeID>;
}

// The card background lives on each row (see projectedRounding.ts), so this
// has to render inside PageLayout's DndContext to follow the drag state.
const FlatTodayList: React.FC<FlatTodayListProps> = ({ items, willDisappearObjectIdSet }) => {
  const { active, over } = useDndContext();
  const rounding = computeSectionRounding(
    items.map((item): string => item.id),
    active?.id as string | undefined,
    over?.id as string | undefined
  );
  return (
    <div>
      {items.map((item) => {
        const rowClassName = classNames(styles.taskItemGroupBackground, {
          [styles.taskItemGroupTopRound]: rounding.top.has(item.id),
          [styles.taskItemGroupBottomRound]: rounding.bottom.has(item.id),
        });
        if (item.type === 'project') {
          return <HomeProjectItem key={item.id} projectInfo={item} className={rowClassName} />;
        }
        return (
          <TaskItemWrapper key={item.id} willDisappear={willDisappearObjectIdSet.has(item.id)} id={item.id}>
            <TaskItem taskInfo={item} className={rowClassName} />
          </TaskItemWrapper>
        );
      })}
    </div>
  );
};

const FlatToday = () => {
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

  const items = todayItems.items;
  const handleCreateTask = (position?: ItemPosition) => {
    const taskId = todoService.addTask({
      title: '',
      startDate: getTodayTimestampInUtc(),
      position: {
        type: 'firstElement',
      },
    });
    if (position && position.type !== 'firstElement') {
      todoService.moveDateAssignedList(taskId, position);
    }
    setTimeout(() => {
      todoService.editItem(taskId);
    }, 100);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = event.active.id as TreeID;
    const overId = event.over?.id as TreeID;
    if (!activeId || !overId) return;
    const action = calculateDragDropAction(
      overId,
      activeId,
      items.map((item) => item.id),
      undefined
    );
    if (action) {
      if (action.type === 'create') {
        handleCreateTask(action.position);
      } else if (action.type === 'move') {
        todoService.moveDateAssignedList(activeId, action.position);
      }
    }
  };

  const sortItems: (TreeID | string)[] = items
    .map((item) => item.id as string)
    .concat([DragDropElements.lastPlacement, DragDropElements.create]);

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
        collisionDetection: singleListCollisionDetectionStrategy,
        sortable: {
          items: sortItems,
          strategy: verticalListSortingStrategy,
          lastPlacement: true,
        },
        onDragEnd: handleDragEnd,
      }}
      onFabClick={() =>
        handleCreateTask({
          type: 'firstElement',
        })
      }
    >
      {tagFilter.filterBar}
      <FlatTodayList items={items} willDisappearObjectIdSet={todayItems.willDisappearObjectIdSet} />
    </PageLayout>
  );
};

export const TodayPage = () => {
  const { value: groupByAreaProject } = useConfig(groupTodayByAreaProjectConfigKey());
  if (!groupByAreaProject) {
    return <FlatToday />;
  }
  return <GroupToday />;
};
