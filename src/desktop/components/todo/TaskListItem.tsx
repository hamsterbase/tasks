import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { taskTitleInputKey } from '@/components/edit/inputKeys';
import { ITaskList } from '@/components/taskList/type.ts';
import { TaskInfo } from '@/core/state/type';
import { desktopStyles } from '@/desktop/theme/main';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useLongPress } from '@/hooks/useLongPress.ts';
import { useRegisterEvent } from '@/hooks/useRegisterEvent.ts';
import { localize } from '@/nls';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { TaskStatusBox } from './TaskStatusBox';

import { EditableInputSpan } from '@/components/edit/EditableInputSpan';
import { DragHandleIcon, NoteIcon, SubtaskIcon } from '@/components/icons';
import { getTaskItemTags } from '@/core/state/getTaskItemTags';
import { useService } from '@/hooks/use-service';
import { useSync } from '@/hooks/use-sync';
import { useContextKeyValue } from '@/hooks/useContextKeyValue';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { InputFocusedContext } from 'vscf/platform/contextkey/common';
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
  const isInputFocused = useContextKeyValue(InputFocusedContext);

  const handleStartEdit = (_value: string, cursor: number) => {
    if (taskList.cursorId === task.id) {
      if (taskList.cursorOffset !== null) {
        if (isInputFocused) {
          return;
        }
      }
    }
    taskList.select(task.id, {
      offset: cursor,
      multipleMode: false,
      fireEditEvent: true,
    });
  };
  const sync = useSync();

  useRegisterEvent(taskList.onFocusItem, (e) => {
    const inputElement = inputRef.current;
    if (e.id !== task.id) {
      return;
    }
    if (!inputElement) {
      sync();
      const inputElement = inputRef.current as HTMLInputElement | null;
      inputElement?.focus({ preventScroll: true });
      inputElement?.setSelectionRange(e.offset, e.offset);
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

  const taskClassName = classNames(desktopStyles.TaskListItemContainer, {
    [desktopStyles.TaskListItemContainerWillDisappear]: willDisappear,
    [desktopStyles.TaskListItemContainerSelected]: (isFocused && isSelected && !isDragging) || isDragging,
    [desktopStyles.TaskListItemContainerSelectedInactive]: !isFocused && isSelected && !isDragging,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    taskList.updateInputValue(e.target.value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...dragListeners}
      className={taskClassName}
      onClickCapture={handleClickCapture}
    >
      {!disableDrag && <DragHandleIcon className={desktopStyles.TaskListItemDragHandle} />}
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
        className={desktopStyles.TaskListItemStatusButton}
        style={{ visibility: isDragging ? 'hidden' : 'visible' }}
      >
        <TaskStatusBox
          status={task.status}
          className={classNames(desktopStyles.TaskListItemStatusBox, {
            [desktopStyles.TaskListItemStatusBoxCompleted]: isCompleted,
            [desktopStyles.TaskListItemStatusBoxUncompleted]: !isCompleted,
          })}
        />
      </button>
      <div className={desktopStyles.TaskListItemContent} style={{ visibility: isDragging ? 'hidden' : 'visible' }}>
        <div className={desktopStyles.TaskListItemTitleRow}>
          <EditableInputSpan
            inputKey={taskTitleInputKey(task.id)}
            ref={inputRef}
            defaultValue={task.title}
            onChange={handleChange}
            isFocused={isSelected && taskList.cursorOffset !== null}
            onStartEdit={handleStartEdit}
            onSave={(value) => {
              taskItemActions.updateTaskTitle(value);
            }}
            className={desktopStyles.TaskListItemTitleInput}
            placeholder={localize('tasks.untitled', 'New Task')}
          />
          {task.notes && <NoteIcon className={desktopStyles.TaskListItemIcon} />}
          {task.children && task.children.length > 0 && <SubtaskIcon className={desktopStyles.TaskListItemIcon} />}
        </div>
        <ItemTagsList tags={tags} isSelected={isSelected} />
      </div>
    </div>
  );
};
