import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { EditableInput } from '@/components/edit/EditableInput';
import { taskTitleInputKey } from '@/components/edit/inputKeys';
import { ITaskList } from '@/components/taskList/type.ts';
import { TaskInfo } from '@/core/state/type';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useLongPress } from '@/hooks/useLongPress.ts';
import { useRegisterEvent } from '@/hooks/useRegisterEvent.ts';
import { localize } from '@/nls';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { TaskStatusBox } from './TaskStatusBox';

import { DragHandleIcon, NoteIcon, SubtaskIcon } from '@/components/icons';
import { getTaskItemTags } from '@/core/state/getTaskItemTags';
import { useService } from '@/hooks/use-service';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItemTagsList } from './ItemTagsList';

export interface TaskListItemProps {
  task: TaskInfo;
  willDisappear: boolean;
  taskList: ITaskList;
  hideProjectTitle?: boolean;
  disableDrag?: boolean;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  willDisappear,
  taskList,
  hideProjectTitle = false,
  disableDrag,
}) => {
  const isCompleted = task.status === 'completed';
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: task.id,
  });

  const dragListeners = {
    ...listeners,
    onMouseDown: (e: React.MouseEvent) => {
      // Prevent drag when interacting with input elements or their containers
      const target = e.target as HTMLElement;
      if (target.closest('input') || target.closest('[data-no-drag]')) {
        return;
      }
      listeners?.onMouseDown?.(e);
    },
  };

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

  const handleClickCapture = (e: React.MouseEvent) => {
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
  };

  const taskClassName = classNames('group relative flex items-start gap-3 px-3 py-3 rounded-md outline-none', {
    'opacity-50': willDisappear,
    'bg-bg3': (isFocused && isSelected && !isDragging) || isDragging,
    'bg-bg2': !isFocused && isSelected && !isDragging,
  });

  const todoService = useService(ITodoService);
  const tags = getTaskItemTags(todoService.modelState, {
    taskId: task.id,
    startDate: task.startDate,
    completionAt: task.completionAt,
    hideProjectTitle,
    status: task.status,
    tags: task.tags,
    dueDate: task.dueDate,
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...dragListeners}
      className={taskClassName}
      onClickCapture={handleClickCapture}
    >
      {!disableDrag && (
        <DragHandleIcon className="absolute -left-5 top-1/2 -translate-y-1/2 size-5 text-t3 opacity-0 group-hover:opacity-60 transition-opacity" />
      )}
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
        style={{ visibility: isDragging ? 'hidden' : 'visible' }}
      >
        <TaskStatusBox
          status={task.status}
          className={classNames('size-5', {
            'text-brand': isCompleted,
            'text-t3': !isCompleted,
          })}
        />
      </button>
      <div className="flex flex-col gap-2 flex-1" style={{ visibility: isDragging ? 'hidden' : 'visible' }}>
        <div className="flex items-center gap-2">
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
            className={'text-base leading-5 flex-1 bg-transparent border-none outline-none text-ellipsis text-t2'}
            placeholder={localize('tasks.untitled', 'New Task')}
          />
          {task.notes && <NoteIcon className="size-5 text-t3 flex-shrink-0" />}
          {task.children && task.children.length > 0 && <SubtaskIcon className="size-5 text-t3 flex-shrink-0" />}
        </div>
        <ItemTagsList tags={tags} isSelected={isSelected} />
      </div>
    </div>
  );
};
