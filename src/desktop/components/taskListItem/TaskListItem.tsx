import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { TaskInfo } from '@/core/state/type';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { TaskItemDueDate } from './TaskItemDueDate';
import { TaskItemIcons } from './TaskItemIcons';
import { TaskStatusBox } from './TaskStatusBox';

export interface TaskListItemProps {
  task: TaskInfo;
  willDisappear: boolean;
  onClick: () => void;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({ task, willDisappear, onClick }) => {
  const isCompleted = task.status === 'completed';
  const todoService = useService(ITodoService);
  const [editValue, setEditValue] = useState(task.title || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const taskItemActions = useTaskItemActions(task);

  useEffect(() => {
    setEditValue(task.title || '');
  }, [task.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleTitleBlur = () => {
    if (editValue.trim() !== task.title) {
      todoService.updateTask(task.id, {
        title: editValue.trim(),
      });
    }
  };

  return (
    <div
      className={classNames('flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all', {
        'hover:bg-bg2': true,
        'opacity-50': willDisappear,
      })}
      onClickCapture={onClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          taskItemActions.toggleTask();
        }}
        className="flex-shrink-0 size-5"
      >
        <TaskStatusBox
          status={task.status}
          className={classNames('size-5', {
            'text-brand': isCompleted,
            'text-t3': !isCompleted,
          })}
        />
      </button>

      <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={editValue}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          className={classNames('text-sm font-medium w-full bg-transparent border-none outline-none text-ellipsis', {
            'text-t1': true,
          })}
          placeholder={localize('tasks.untitled', 'New Task')}
        />
        {task.projectTitle && (
          <p
            className={classNames('text-xs mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap', {
              'text-t3': true,
            })}
          >
            {task.projectTitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <TaskItemDueDate dueDate={task.dueDate} />
        <TaskItemIcons tags={task.tags} notes={task.notes} subtasks={task.children} navIcon={false} />
      </div>
    </div>
  );
};
