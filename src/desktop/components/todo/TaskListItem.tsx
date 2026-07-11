import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { taskTitleInputKey } from '@/components/edit/inputKeys';
import { ITaskList } from '@/components/taskList/type.ts';
import { TaskInfo } from '@/core/state/type';
import { desktopStyles } from '@/desktop/theme/main';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useLongPress } from '@/hooks/useLongPress.ts';
import { useRegisterEvent } from '@/hooks/useRegisterEvent.ts';
import { localize } from '@/nls';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { TaskIcon } from './TaskIcon';

import { EditableInputSpan } from '@/components/edit/EditableInputSpan';
import { DragHandleIcon, NotesIcon, SubtaskIcon } from '@/components/icons';
import { getTaskItemTags } from '@/core/state/getTaskItemTags';
import { useService } from '@/hooks/use-service';
import { useSync } from '@/hooks/use-sync';
import { useContextKeyValue } from '@/hooks/useContextKeyValue';
import { IAttachmentUploadService } from '@/services/attachment/common/attachmentUploadService';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { InputFocusedContext } from '@hamsterbase/foundation/contextkey';
import { ItemTagsList } from './ItemTagsList';

export interface TaskListItemProps {
  task: TaskInfo;
  willDisappear: boolean;
  taskList: ITaskList;
  hideProjectTitle?: boolean;
  disableDrag?: boolean;
  followParentArchiveState?: boolean;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  willDisappear,
  taskList,
  hideProjectTitle = false,
  disableDrag,
  followParentArchiveState,
}) => {
  const isCompletedLike = task.status === 'completed' || task.status === 'canceled';
  const isArchivedLike = followParentArchiveState && task.isParentArchived;
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: task.id,
    disabled: disableDrag,
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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    pointerEvents: isDragging ? 'none' : 'auto',
  };

  if (isDragging) {
    style.opacity = 0.6;
  } else if (isCompletedLike) {
    style.opacity = 0.6;
  } else if (willDisappear || isArchivedLike) {
    style.opacity = 0.5;
  }

  useWatchEvent(taskList.onListStateChange);

  const isSelected = taskList.selectedIds.includes(task.id);
  const isFocused = taskList.isFocused;
  const isEditing = taskList.isEditing && taskList.cursorId === task.id;

  const taskItemActions = useTaskItemActions(task);

  const longPress = useLongPress(() => {
    taskItemActions.cancelTask();
  });
  const isInputFocused = useContextKeyValue(InputFocusedContext);

  const handleStartEdit = (value: string, cursor: number) => {
    if (taskList.cursorId === task.id) {
      taskList.updateInputValue(value);
      if (taskList.cursorOffset !== null) {
        if (isInputFocused) {
          taskList.updateCursor(cursor);
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
    if (e.id !== task.id) {
      return;
    }
    // taskList.select(..., fireEditEvent: true) already set _isEditing = true
    // and cursorId = task.id synchronously. sync() flushes the pending render
    // so the input is mounted (not display:none) before focus() runs.
    sync();
    const inputElement = inputRef.current;
    if (!inputElement) {
      return;
    }
    inputElement.focus({ preventScroll: true });
    if (e.selectAll) {
      inputElement.select();
    } else {
      inputElement.setSelectionRange(e.offset, e.offset);
    }
  });

  const hasModifier = (e: React.MouseEvent) => e.metaKey || e.shiftKey || e.ctrlKey || e.altKey;

  const handleClickCapture = (e: React.MouseEvent) => {
    let element = e.target as HTMLElement;
    while (element && element !== e.currentTarget) {
      if (element.getAttribute('data-testid') === TestIds.TaskListItem.StatusBox) {
        return;
      }
      if (element.dataset?.titleText === 'true' && !hasModifier(e)) {
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

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (hasModifier(e)) return;
    let element = e.target as HTMLElement;
    while (element && element !== e.currentTarget) {
      if (element.dataset?.titleText === 'true') return;
      if (element.getAttribute('data-testid') === TestIds.TaskListItem.StatusBox) return;
      element = element.parentElement as HTMLElement;
    }
    taskList.select(task.id, {
      offset: 0,
      multipleMode: false,
      fireEditEvent: true,
      selectAll: true,
    });
  };

  const taskClassName = classNames(desktopStyles.TaskListItemContainer, {
    [desktopStyles.TaskListItemContainerCompleted]: isCompletedLike,
    [desktopStyles.TaskListItemContainerWillDisappear]: willDisappear,
    [desktopStyles.TaskListItemContainerSelected]: (isFocused && isSelected && !isDragging) || isDragging,
    [desktopStyles.TaskListItemContainerSelectedInactive]: !isFocused && isSelected && !isDragging,
    [desktopStyles.TaskListItemContainerArchived]: isArchivedLike,
  });

  const todoService = useService(ITodoService);
  const attachmentService = useService(IAttachmentUploadService);
  useWatchEvent(attachmentService.onChange);
  const attachmentCount = attachmentService.listAttachmentsByParent(task.uid).length;
  const tags = getTaskItemTags(todoService.modelState, {
    taskId: task.id,
    startDate: task.startDate,
    completionAt: task.completionAt,
    hideProjectTitle,
    status: task.status,
    tags: task.tags,
    dueDate: task.dueDate,
    attachmentCount,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    taskList.updateInputValue(e.target.value);
  };

  const titleClassName = classNames(desktopStyles.TaskListItemTitleInput, {
    [desktopStyles.TaskListItemTitleInputCompleted]: task.status === 'completed',
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...dragListeners}
      className={taskClassName}
      onClickCapture={handleClickCapture}
      onDoubleClick={handleDoubleClick}
      data-task-id={task.id}
      data-testid={TestIds.TaskListItem.Root}
      data-selected={isSelected ? 'true' : undefined}
    >
      {!disableDrag && (
        <span className={desktopStyles.TaskListItemDragHandle}>
          <DragHandleIcon className={desktopStyles.TaskListItemDragHandleIcon} />
        </span>
      )}
      <button
        {...longPress.longPressEvents}
        data-testid={TestIds.TaskListItem.StatusBox}
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
        <TaskIcon status={task.status} />
      </button>
      <div className={desktopStyles.TaskListItemContent} style={{ visibility: isDragging ? 'hidden' : 'visible' }}>
        <div className={desktopStyles.TaskListItemTitleRow} data-testid={TestIds.TaskListItem.Title}>
          <EditableInputSpan
            inputKey={taskTitleInputKey(task.id)}
            ref={inputRef}
            defaultValue={task.title}
            onChange={handleChange}
            isFocused={isEditing}
            onStartEdit={handleStartEdit}
            onSave={(value) => {
              taskItemActions.updateTaskTitle(value);
            }}
            className={titleClassName}
            placeholder={localize('tasks.untitled', 'New Task')}
          />
          {task.notes && <NotesIcon className={desktopStyles.TaskListItemIcon} />}
          {task.children && task.children.length > 0 && <SubtaskIcon className={desktopStyles.TaskListItemIcon} />}
        </div>
        <ItemTagsList tags={tags} isSelected={isSelected} />
      </div>
    </div>
  );
};
