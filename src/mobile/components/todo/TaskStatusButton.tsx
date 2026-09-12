import { ItemStatus } from '@/core/type';
import { useService } from '@/hooks/use-service';
import { useLongPress } from '@/hooks/useLongPress';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { TreeID } from 'loro-crdt';
import React from 'react';
import { TaskCheckbox } from '../icon/TaskCheckbox';
import { ItemStatusAnimationPhase } from '@/components/todo/itemStatusVisual';
import { triggerCompletionHaptic } from '@/mobile/utils/triggerCompletionHaptic';

interface TaskStatusButtonProps {
  taskId: TreeID;
  status: ItemStatus;
  className?: string;
  testId?: string;
  animationPhase?: ItemStatusAnimationPhase;
}

export const TaskStatusButton: React.FC<TaskStatusButtonProps> = ({
  taskId,
  status,
  className,
  testId,
  animationPhase,
}) => {
  const todoService = useService(ITodoService);
  const popupAction = usePopupAction();

  const handleLongPress = () => {
    popupAction({
      groups: [
        {
          items: [
            {
              condition: status !== 'created',
              icon: <TaskCheckbox status={'created'} />,
              name: localize('tasks.mark_as_created', 'Mark as Created'),
              onClick: () => {
                todoService.updateTask(taskId, { status: 'created' });
              },
            },
            {
              condition: status !== 'completed',
              icon: <TaskCheckbox status={'completed'} />,
              name: localize('tasks.mark_as_completed', 'Mark as Completed'),
              onClick: () => {
                triggerCompletionHaptic();
                todoService.updateTask(taskId, { status: 'completed' });
              },
            },
            {
              condition: status !== 'canceled',
              icon: <TaskCheckbox status={'canceled'} />,
              name: localize('tasks.mark_as_canceled', 'Mark as Canceled'),
              onClick: () => {
                todoService.updateTask(taskId, { status: 'canceled' });
              },
            },
          ],
        },
      ],
    });
  };

  const { longPressEvents } = useLongPress(handleLongPress);

  const toggleTask = () => {
    if (status !== 'created') {
      todoService.updateTask(taskId, { status: 'created' });
    } else {
      triggerCompletionHaptic();
      todoService.updateTask(taskId, { status: 'completed' });
    }
  };

  return (
    <button
      data-testid={testId}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTask();
      }}
      {...longPressEvents}
      className={className}
    >
      <TaskCheckbox status={status} animationPhase={animationPhase} />
    </button>
  );
};
