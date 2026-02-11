import { TaskInfo } from '@/core/state/type';
import { TaskStatusBox } from '@/mobile/components/taskItem/TaskStatusBox';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { ITodoService } from '@/services/todo/common/todoService';
import { localize } from '@/nls';
import React from 'react';
import { useService } from './use-service';

export const useTaskActions = (taskInfo: TaskInfo | null) => {
  const todoService = useService(ITodoService);
  const popupAction = usePopupAction();
  if (!taskInfo) {
    return null;
  }
  const toggleTask = () => {
    if (taskInfo.status !== 'created') {
      todoService.updateTask(taskInfo.id, { status: 'created' });
    } else {
      todoService.updateTask(taskInfo.id, { status: 'completed' });
    }
  };
  const handleLongPress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    popupAction({
      groups: [
        {
          items: [
            {
              condition: taskInfo.status !== 'created',
              icon: <TaskStatusBox status={'created'} />,
              name: localize('tasks.mark_as_created', 'Mark as Created'),
              onClick: () => {
                todoService.updateTask(taskInfo.id, { status: 'created' });
              },
            },
            {
              condition: taskInfo.status !== 'completed',
              icon: <TaskStatusBox status={'completed'} />,
              name: localize('tasks.mark_as_completed', 'Mark as Completed'),
              onClick: () => {
                todoService.updateTask(taskInfo.id, { status: 'completed' });
              },
            },
            {
              condition: taskInfo.status !== 'canceled',
              icon: <TaskStatusBox status={'canceled'} />,
              name: localize('tasks.mark_as_canceled', 'Mark as Canceled'),
              onClick: () => {
                todoService.updateTask(taskInfo.id, { status: 'canceled' });
              },
            },
          ],
        },
      ],
    });
  };

  return { toggleTask, handleLongPress };
};
