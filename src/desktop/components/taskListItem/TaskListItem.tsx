import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { EditableInput } from '@/components/edit/EditableInput';
import { taskTitleInputKey } from '@/components/edit/inputKeys';
import { ITaskList } from '@/components/taskList/type.ts';
import { TaskInfo } from '@/core/state/type';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useRegisterEvent } from '@/hooks/useRegisterEvent.ts';
import { localize } from '@/nls';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { TaskItemDueDate } from './TaskItemDueDate';
import { TaskItemIcons } from './TaskItemIcons';
import { TaskStatusBox } from './TaskStatusBox';

export interface TaskListItemProps {
  task: TaskInfo;
  willDisappear: boolean;
  taskList: ITaskList;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({ task, willDisappear, taskList }) => {
  const isCompleted = task.status === 'completed';
  const inputRef = useRef<HTMLInputElement>(null);

  useWatchEvent(taskList.onListStateChange);

  const isSelected = taskList.selectedIds.includes(task.id);
  const isFocused = taskList.isFocused;

  const taskItemActions = useTaskItemActions(task);

  const handleInputSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    if (!target) {
      return;
    }
    taskList.updateCursor(target.selectionStart ?? 0);
    taskList.updateInputValue(target.value);
  };

  useRegisterEvent(taskList.onFocusItem, (e) => {
    const inputElement = inputRef.current;
    if (e.id !== task.id || !inputElement) {
      return;
    }
    inputElement.focus({ preventScroll: true });
    inputElement.setSelectionRange(e.offset, e.offset);
  });

  return (
    <div
      className={classNames('flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all', {
        'hover:bg-bg2': true,
        'opacity-50': willDisappear,
        'bg-bg3': isFocused && isSelected,
        'bg-bg2': !isFocused && isSelected,
      })}
      onClickCapture={(e) => {
        e.stopPropagation();
        const taskId = task.id;
        if (e.metaKey) {
          taskList.select(taskId, {
            offset: null,
            multipleMode: true,
          });
        } else {
          taskList.select(taskId, {
            offset: null,
            multipleMode: false,
          });
        }
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          taskItemActions.toggleTask();
        }}
        className="flex-shrink-0 size-5 outline-none"
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
        <EditableInput
          inputKey={taskTitleInputKey(task.id)}
          ref={inputRef}
          defaultValue={task.title}
          onChange={(e) => {
            taskList.updateInputValue(e.target.value);
          }}
          onSelect={handleInputSelect}
          onSave={(value) => {
            taskItemActions.updateTaskTitle(value);
          }}
          className={'text-sm font-medium w-full bg-transparent border-none outline-none text-ellipsis text-t1'}
          placeholder={localize('tasks.untitled', 'New Task')}
        />
        {task.projectTitle && (
          <p className={'text-xs mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-t3 opacity-50'}>
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
