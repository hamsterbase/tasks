import { handleFocusAndScroll } from '@/base/browser/commonFocusHandler';
import { DragHandleIcon } from '@/components/icons';
import { ItemStatus } from '@/core/type.ts';
import { useLongPress } from '@/hooks/useLongPress';
import { TaskCheckbox } from '@/mobile/components/icon/TaskCheckbox';
import { localize } from '@/nls';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';

interface SubtaskItemProps {
  id: string;
  title: string;
  status: ItemStatus;
  onStatusChange: (id: string, status: ItemStatus) => void;
  onTitleChange: (id: string, title: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  inputRef?: (el: HTMLInputElement | null) => void;
  className?: string;
  disableDragStyle?: boolean;
  inputTestId?: string;
  statusButtonClassName?: string;
  inputClassName?: string;
  dragHandleClassName?: string;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  id,
  title,
  status,
  onStatusChange,
  onTitleChange,
  onCreate,
  onDelete,
  inputRef,
  className,
  disableDragStyle = false,
  inputTestId,
  statusButtonClassName,
  inputClassName,
  dragHandleClassName,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    onStatusChange(id, status === 'created' ? 'completed' : 'created');
  };

  const { longPressEvents } = useLongPress(() => {
    if (status === 'canceled') {
      onStatusChange(id, 'created');
    } else {
      onStatusChange(id, 'canceled');
    }
  });

  const [inputValue, setInputValue] = React.useState(title);

  React.useEffect(() => {
    setInputValue(title);
  }, [title]);

  const handleBlur = () => {
    if (inputValue !== title) {
      onTitleChange(id, inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCreate();
    }
    if (e.key === 'Backspace' && inputValue === '') {
      onDelete(id);
      e.preventDefault();
    }
  };

  if (isDragging && !disableDragStyle) {
    return <div className="flex items-center gap-1.5 bg-bg3 rounded-lg w-full" ref={setNodeRef} style={style}></div>;
  }

  return (
    <div className={classNames('flex items-center gap-1.5', className)} ref={setNodeRef} style={style}>
      <div
        onClick={handleClick}
        {...longPressEvents}
        className={classNames('flex items-center justify-center text-t3', statusButtonClassName)}
      >
        <TaskCheckbox size="small" status={status} />
      </div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={handleFocusAndScroll}
        className={classNames(
          'flex-1 text-sm leading-6 bg-transparent border-none outline-none p-0 placeholder:text-t4',
          inputClassName,
          status === 'canceled' ? 'text-t3 line-through' : status === 'completed' ? 'text-t3' : 'text-t1'
        )}
        placeholder={localize('mobile.subtask.placeholder', 'Subtask')}
        ref={inputRef}
        data-testid={inputTestId}
      />
      <DragHandleIcon
        className={classNames('size-4 cursor-grab text-t3 opacity-40', dragHandleClassName)}
        strokeWidth={1.5}
        {...attributes}
        {...listeners}
      />
    </div>
  );
};
