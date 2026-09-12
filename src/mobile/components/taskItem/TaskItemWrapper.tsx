import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { ITodoService } from '@/services/todo/common/todoService';
import { getTaskInfo } from '@/core/state/getTaskInfo';
import { useItemStatusAnimation } from '@/hooks/useItemStatusAnimation';
import classNames from 'classnames';
import type { TreeID } from 'loro-crdt';
import React from 'react';

interface TaskItemWrapperProps {
  id: TreeID;
  willDisappear: boolean;
  children: React.ReactNode;
}

const TaskItemWrapper: React.FC<TaskItemWrapperProps> = ({ id, willDisappear, children }) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onEditingContentChange);

  const isEditing = todoService.editingContent?.id === id;
  const task = getTaskInfo(todoService.modelState, id);
  const animationPhase = useItemStatusAnimation(task.status);
  const className = classNames({
    'item-status-row-exiting': willDisappear && !isEditing,
  });
  return (
    <div
      className={className}
      data-status-animation={animationPhase}
      data-exiting={willDisappear && !isEditing && animationPhase === 'settling' ? 'true' : undefined}
    >
      {children}
    </div>
  );
};

export default TaskItemWrapper;
