import { getTodayTimestampInUtc } from '@/base/common/time';
import { InboxIcon } from '@/components/icons';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
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
import { TaskItem } from '../components/todo/TaskItem';
import { styles } from '../theme';

export const InboxPage = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const { showFutureTasks, showCompletedTasks, openTaskDisplaySettings, completedAfter } =
    useTaskDisplaySettings('inbox');

  const { inboxTasks, willDisappearObjectIdSet } = getInboxTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    showFutureTasks,
    showCompletedTasks,
    showCompletedTasksAfter: completedAfter,
    keepAliveElements: todoService.keepAliveElements,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || typeof over.id !== 'string' || typeof active.id !== 'string') return;
    const action = calculateDragDropAction(
      over.id,
      active.id,
      inboxTasks.map((task) => task.id)
    );
    if (!action) return;
    if (action.type === 'create') {
      const taskId = todoService.addTask({
        title: '',
        position: action.position,
      });
      setTimeout(() => {
        todoService.editItem(taskId);
      }, 60);
    } else {
      todoService.updateTask(active.id as TreeID, {
        position: action.position,
      });
    }
  };

  const handleCreateTask = () => {
    const task = todoService.addTask({
      title: '',
    });
    todoService.editItem(task);
  };

  const sortItems: string[] = inboxTasks
    .map((task): string => task.id)
    .concat([DragDropElements.lastPlacement, DragDropElements.create]);

  return (
    <PageLayout
      bottomMenu={{
        left: 'back',
        mid: {
          onClick: handleCreateTask,
        },
      }}
      header={{
        id: 'inbox',
        title: localize('inbox', 'Inbox'),
        renderIcon: (className: string) => <InboxIcon className={className} />,
        handleClickTaskDisplaySettings: openTaskDisplaySettings,
      }}
      dragOption={{
        overlayItem: {},
        collisionDetection: singleListCollisionDetectionStrategy,
        onDragEnd: handleDragEnd,
        sortable: {
          lastPlacement: true,
          items: sortItems,
          strategy: verticalListSortingStrategy,
        },
      }}
    >
      <div className={classNames(styles.taskItemGroupBackground, styles.taskItemGroupRound)}>
        {inboxTasks.map((task) => (
          <TaskItemWrapper key={task.id} willDisappear={willDisappearObjectIdSet.has(task.id)} id={task.id}>
            <TaskItem taskInfo={task} key={task.id} />
          </TaskItemWrapper>
        ))}
      </div>
    </PageLayout>
  );
};
