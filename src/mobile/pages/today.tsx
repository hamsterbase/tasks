import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { TodayIcon } from '@/components/icons';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { ItemPosition } from '@/core/type';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { calculateDragDropAction } from '@/utils/dnd/calculateDragDropAction';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { singleListCollisionDetectionStrategy } from '@/utils/dnd/singleListCollisionDetectionStrategy';
import { DragEndEvent } from '@dnd-kit/core';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../components/todo/HomeProjectItem';
import { TaskItem } from '../components/todo/TaskItem';
import { styles } from '../theme';
import { useTaskDisplaySettingsMobile } from '../hooks/useTaskDisplaySettings';

export const TodayPage = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const { showCompletedTasks, openTaskDisplaySettings } = useTaskDisplaySettingsMobile('today', {
    hideShowFutureTasks: true,
  });

  const todayItems = getTodayItems(todoService.modelState, getTodayTimestampInUtc(), {
    showCompletedTasks,
    showFutureTasks: false,
    currentDate: getTodayTimestampInUtc(),
    completedAfter: getTodayTimestampInUtc(),
    recentChangedTaskSet: new Set<TreeID>(todoService.keepAliveElements as TreeID[]),
  });

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
        id: 'today',
        title: localize('today', 'Today'),
        renderIcon: (className: string) => <TodayIcon className={className} />,
        handleClickTaskDisplaySettings: openTaskDisplaySettings,
      }}
      dragOption={{
        overlayItem: {
          projectProps: {
            hideStartDate: true,
          },
          textProps: {
            hideStartDate: true,
          },
        },
        collisionDetection: singleListCollisionDetectionStrategy,
        sortable: {
          items: sortItems,
          strategy: verticalListSortingStrategy,
          lastPlacement: true,
        },
        onDragEnd: handleDragEnd,
      }}
      bottomMenu={{
        left: 'back',
        mid: {
          onClick: () =>
            handleCreateTask({
              type: 'firstElement',
            }),
        },
      }}
    >
      <div className={classNames(styles.taskItemGroupBackground, styles.taskItemGroupRound)}>
        {items.map((item) => {
          const willDisappear = todayItems.willDisappearObjectIdSet.has(item.id);
          if (item.type === 'project') {
            return <HomeProjectItem key={item.id} projectInfo={item} hideStartDate={true} />;
          }
          return (
            <TaskItemWrapper key={item.id} willDisappear={willDisappear} id={item.id}>
              <TaskItem taskInfo={item} hideStartDate={true} />
            </TaskItemWrapper>
          );
        })}
      </div>
    </PageLayout>
  );
};
