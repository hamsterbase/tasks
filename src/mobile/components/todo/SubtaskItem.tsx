import { handleFocusAndScroll } from '@/base/browser/commonFocusHandler';
import { DragHandleIcon } from '@/components/icons';
import { ItemStatus } from '@/core/type.ts';
import { TaskStatusBox } from '@/mobile/components/taskItem/TaskStatusBox';
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
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    onStatusChange(id, status === 'created' ? 'completed' : 'created');
  };

  const handleLongPress = () => {
    if (status === 'canceled') {
      onStatusChange(id, 'created');
    } else {
      onStatusChange(id, 'canceled');
    }
  };

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
    }
  };

  if (isDragging && !disableDragStyle) {
    return <div className="flex items-center h-10 bg-bg3 rounded-lg w-full" ref={setNodeRef} style={style}></div>;
  }

  return (
    <div className={classNames('flex items-center h-10  rounded-lg', className)} ref={setNodeRef} style={style}>
      <button
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          handleLongPress();
        }}
        className={classNames('size-4 flex items-center justify-center')}
      >
        <TaskStatusBox
          className={classNames('w-4 h-4', {
            'text-t2': status === 'created',
            'text-brand': status === 'completed',
            'text-t3': status === 'canceled',
          })}
          status={status}
        />
      </button>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={handleFocusAndScroll}
        className={classNames(
          'flex-1 px-2 py-0 text-sm border-0 focus:outline-none bg-transparent h-8 resize-none leading-8',
          {
            'line-through': status === 'canceled',
          }
        )}
        style={{ display: 'flex', alignItems: 'center' }}
        placeholder={localize('subtask.placeholder', 'Add subtask...')}
        ref={inputRef}
      />
      <DragHandleIcon className="w-5 h-5 text-t3 cursor-move outline-none" {...attributes} {...listeners} />
    </div>
  );
};
