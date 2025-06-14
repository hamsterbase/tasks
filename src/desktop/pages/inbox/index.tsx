import { getTodayTimestampInUtc } from '@/base/common/time';
import { InboxIcon } from '@/components/icons';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { TaskListItem } from '@/desktop/components/taskListItem/TaskListItem';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { localize } from '@/nls';
import { ISelectionService } from '@/services/selection/common/selectionService';
import { ITodoService } from '@/services/todo/common/todoService';
import { TreeID } from 'loro-crdt';
import React from 'react';

export const Inbox = () => {
  const todoService = useService(ITodoService);
  const selectionService = useService(ISelectionService);
  useWatchEvent(todoService.onStateChange);
  const { showFutureTasks, showCompletedTasks, completedAfter } = useTaskDisplaySettings('inbox');

  const { inboxTasks, willDisappearObjectIdSet } = getInboxTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    showFutureTasks,
    showCompletedTasks,
    showCompletedTasksAfter: completedAfter,
    keepAliveElements: todoService.keepAliveElements,
  });

  const handleTaskClick = (taskId: TreeID) => {
    selectionService.select(taskId);
  };

  return (
    <div className="h-full w-full bg-bg1">
      <div className="h-full flex flex-col">
        <div className="h-12 flex items-center justify-between px-4 border-b border-line-light bg-bg1">
          <div className="flex items-center gap-2">
            <InboxIcon className="size-5 text-t2" />
            <h1 className="text-lg font-medium text-t1">{localize('inbox', 'Inbox')}</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-0.5">
            {inboxTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                willDisappear={willDisappearObjectIdSet.has(task.id)}
                onClick={() => handleTaskClick(task.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
