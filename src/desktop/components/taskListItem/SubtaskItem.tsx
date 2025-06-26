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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { TaskStatusBox } from './TaskStatusBox';

interface SubtaskItemProps {
  subtask: SubTaskInfo;
  subList: ITaskList;
  className?: string;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({ subtask, subList, className }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: subtask.id });
  const inputElementRef = useRef<HTMLInputElement>(null);
  const todoService = useService(ITodoService);

  useWatchEvent(subList.onListStateChange);

  const isSelected = subList.selectedIds.includes(subtask.id);
  const isFocused = subList.isFocused;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    const newStatus: ItemStatus = subtask.status === 'created' ? 'completed' : 'created';
    todoService.updateTask(subtask.id, { status: newStatus });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const newStatus: ItemStatus = subtask.status === 'canceled' ? 'created' : 'canceled';
    todoService.updateTask(subtask.id, { status: newStatus });
  };

  const handleInputSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    if (!target) {
      return;
    }
    subList.updateCursor(target.selectionStart ?? 0);
    subList.updateInputValue(target.value);
  };

  useRegisterEvent(subList.onFocusItem, (e) => {
    const inputElement = inputElementRef.current;
    if (e.id !== subtask.id || !inputElement) {
      return;
    }
    inputElement.focus({ preventScroll: true });
    inputElement.setSelectionRange(e.offset, e.offset);
  });

  if (isDragging) {
    return <div className="flex items-center h-8 bg-bg3 rounded opacity-50" ref={setNodeRef} style={style} />;
  }

  return (
    <div
      className={classNames('flex items-center gap-2 h-8 rounded hover:bg-bg2 px-1 group', className, {
        'bg-bg3': isFocused && isSelected,
        'bg-bg2': !isFocused && isSelected,
      })}
      ref={setNodeRef}
      style={style}
      onClickCapture={(e) => {
        e.stopPropagation();
        const subtaskId = subtask.id;
        if (e.metaKey) {
          subList.select(subtaskId, {
            offset: null,
            multipleMode: true,
          });
        } else {
          subList.select(subtaskId, {
            offset: null,
            multipleMode: false,
          });
        }
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onContextMenu={handleContextMenu}
        className="size-4 flex items-center justify-center hover:bg-bg3 rounded transition-colors flex-shrink-0"
      >
        <TaskStatusBox className="size-4 text-t3" status={subtask.status} />
      </button>

      <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <EditableInput
          inputKey={taskTitleInputKey(subtask.id)}
          ref={inputElementRef}
          defaultValue={subtask.title}
          onChange={(e) => {
            subList.updateInputValue(e.target.value);
          }}
          onSelect={handleInputSelect}
          onSave={(value) => {
            todoService.updateTask(subtask.id, { title: value });
          }}
          className={classNames('text-sm bg-transparent outline-none border-none w-full', {
            'line-through text-t3': subtask.status === 'canceled',
            'text-t3': subtask.status === 'completed',
            'text-t1': subtask.status === 'created',
          })}
          placeholder={localize('subtask.placeholder', 'Add subtask...')}
        />
      </div>

      <button
        className="opacity-0 group-hover:opacity-100 hover:bg-bg3 p-1 rounded transition-all flex-shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <DragHandleIcon className="size-3 text-t3" />
      </button>
    </div>
  );
};
