import { DragHandleIcon } from '@/components/icons';
import { EditableInput } from '@/components/edit/EditableInput';
import { taskTitleInputKey } from '@/components/edit/inputKeys';
import { ITaskList } from '@/components/taskList/type.ts';
import { SubTaskInfo } from '@/core/state/type';
import { ItemStatus } from '@/core/type.ts';
import { localize } from '@/nls';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useRegisterEvent } from '@/hooks/useRegisterEvent.ts';
import { useService } from '@/hooks/use-service';
import { ITodoService } from '@/services/todo/common/todoService';
import { useLongPress } from '@/hooks/useLongPress.ts';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { TaskStatusBox } from './TaskStatusBox';
import { desktopStyles } from '@/desktop/theme/main';

interface SubtaskItemProps {
  subtask: SubTaskInfo;
  subList: ITaskList;
  className?: string;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({ subtask, subList, className }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: subtask.id });
  const inputElementRef = useRef<HTMLInputElement>(null);
  const todoService = useService(ITodoService);

  useWatchEvent(todoService.onStateChange);
  useWatchEvent(subList.onListStateChange);

  const isSelected = subList.selectedIds.includes(subtask.id);
  const isFocused = subList.isFocused;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Status handlers
  const handleToggleStatus = () => {
    const newStatus: ItemStatus = subtask.status === 'created' ? 'completed' : 'created';
    todoService.updateTask(subtask.id, { status: newStatus });
  };

  const handleToggleCancel = () => {
    const newStatus: ItemStatus = subtask.status === 'canceled' ? 'created' : 'canceled';
    todoService.updateTask(subtask.id, { status: newStatus });
  };

  const longPress = useLongPress(handleToggleCancel);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    subList.updateInputValue(e.target.value);
  };

  const handleInputSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    if (!target) return;

    subList.updateCursor(target.selectionStart ?? 0);
    subList.updateInputValue(target.value);
  };

  const handleInputSave = (value: string) => {
    todoService.updateTask(subtask.id, { title: value });
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    let element = e.target as HTMLElement;
    while (element && element !== e.currentTarget) {
      if (element.tagName === 'BUTTON') {
        return;
      }
      element = element.parentElement as HTMLElement;
    }
    e.stopPropagation();
    const subtaskId = subtask.id;
    const multipleMode = e.metaKey;
    subList.select(subtaskId, {
      offset: null,
      multipleMode,
    });
  };

  const handleStatusButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (longPress.isLongPress.current) {
      return;
    }
    handleToggleStatus();
  };

  const handleStopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  useRegisterEvent(subList.onFocusItem, (e) => {
    const inputElement = inputElementRef.current;
    if (e.id !== subtask.id || !inputElement) {
      return;
    }
    inputElement.focus({ preventScroll: true });
    inputElement.setSelectionRange(e.offset, e.offset);
  });

  const inputClassName = classNames('text-sm bg-transparent outline-none border-none w-full', {
    'line-through text-t3': subtask.status === 'canceled',
    'text-t3': subtask.status === 'completed',
    'text-t1': subtask.status === 'created',
  });

  const containerClassName = classNames('flex items-center gap-2 h-8 rounded hover:bg-bg2 px-1 group', className, {
    'bg-bg3': isFocused && isSelected,
    'bg-bg2': !isFocused && isSelected,
  });

  if (isDragging) {
    return <div className={desktopStyles.TaskListItemOldSubtaskDragging} ref={setNodeRef} style={style} />;
  }

  return (
    <div className={containerClassName} ref={setNodeRef} style={style} onClickCapture={handleContainerClick}>
      <button
        {...longPress.longPressEvents}
        onClick={handleStatusButtonClick}
        onPointerDown={handleStopPropagation}
        className={desktopStyles.TaskListItemOldStatusButton}
      >
        <TaskStatusBox className={desktopStyles.TaskListItemOldStatusBox} status={subtask.status} />
      </button>

      <div
        className={desktopStyles.TaskListItemOldInputWrapper}
        onClick={handleStopPropagation}
        onPointerDown={handleStopPropagation}
      >
        <EditableInput
          inputKey={taskTitleInputKey(subtask.id)}
          ref={inputElementRef}
          defaultValue={subtask.title}
          onChange={handleInputChange}
          onSelect={handleInputSelect}
          onSave={handleInputSave}
          className={inputClassName}
          placeholder={localize('subtask.placeholder', 'Add subtask...')}
        />
      </div>

      <button
        className={desktopStyles.TaskListItemOldDragHandle}
        onPointerDown={handleStopPropagation}
        {...attributes}
        {...listeners}
      >
        <DragHandleIcon className={desktopStyles.TaskListItemOldDragHandleIcon} />
      </button>
    </div>
  );
};
