import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { EditableInput } from '@/components/edit/EditableInput';
import { taskTitleInputKey } from '@/components/edit/inputKeys';
import { ITaskList } from '@/components/taskList/type.ts';
import { TaskInfo } from '@/core/state/type';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useRegisterEvent } from '@/hooks/useRegisterEvent.ts';
import { useLongPress } from '@/hooks/useLongPress.ts';
import { localize } from '@/nls';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { TaskItemDueDate } from './TaskItemDueDate';
import { TaskItemIcons } from './TaskItemIcons';
import { TaskStatusBox } from './TaskStatusBox';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface TaskListItemProps {
  task: TaskInfo;
  willDisappear: boolean;
  taskList: ITaskList;
  hideProjectTitle?: boolean;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  willDisappear,
  taskList,
  hideProjectTitle = false,
}) => {
  const isCompleted = task.status === 'completed';
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.6 : 1,
    pointerEvents: (isDragging ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
  };

  useWatchEvent(taskList.onListStateChange);

  const isSelected = taskList.selectedIds.includes(task.id);
  const isFocused = taskList.isFocused;

  const taskItemActions = useTaskItemActions(task);

  const longPress = useLongPress(() => {
    taskItemActions.cancelTask();
  });

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
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classNames('group relative flex items-center gap-2 px-3 py-2 rounded-md', {
        'opacity-50': willDisappear,
        'bg-bg3': isFocused && isSelected && !isDragging,
        'bg-bg2': !isFocused && isSelected && !isDragging,
        'hover:bg-bg2': !isDragging,
      })}
      onClickCapture={(e) => {
        let element = e.target as HTMLElement;
        while (element && element !== e.currentTarget) {
          if (element.getAttribute('data-testid') === 'task-item-status-box') {
            return;
          }
          element = element.parentElement as HTMLElement;
        }
        
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
        {...longPress.longPressEvents}
        data-testid="task-item-status-box"
        onClick={(e) => {
          e.stopPropagation();
          if (longPress.isLongPress.current) {
            return;
          }
          taskItemActions.toggleTask();
        }}
        onPointerDown={(e) => e.stopPropagation()}
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

      <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
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
        {task.projectTitle && !hideProjectTitle && (
          <p className={'text-xs mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-t3 opacity-50'}>
            {task.projectTitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0" onPointerDown={(e) => e.stopPropagation()}>
        <TaskItemDueDate dueDate={task.dueDate} />
        <TaskItemIcons tags={task.tags} notes={task.notes} subtasks={task.children} navIcon={false} />
      </div>
    </div>
  );
};
