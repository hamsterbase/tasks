import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { ITodoService } from '@/services/todo/common/todoService';
import classNames from 'classnames';
import React from 'react';

interface TaskItemWrapperProps {
  id: string;
  willDisappear: boolean;
  children: React.ReactNode;
}

const TaskItemWrapper: React.FC<TaskItemWrapperProps> = ({ id, willDisappear, children }) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onEditingContentChange);

  const isEditing = todoService.editingContent?.id === id;
  const className = classNames({
    'opacity-35': willDisappear && !isEditing,
    'transition-opacity duration-1000 ease-in-out': willDisappear && !isEditing,
    'animate-fade-out': willDisappear && !isEditing,
  });
  return <div className={className}>{children}</div>;
};

export default TaskItemWrapper;
