import { EditableInput } from '@/components/edit/EditableInput';
import { projectHeadingTitleInputKey } from '@/components/edit/inputKeys';
import { DragHandleIcon, HeadingIcon } from '@/components/icons';
import { ITaskList } from '@/components/taskList/type.ts';
import { ProjectHeadingInfo } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useRegisterEvent } from '@/hooks/useRegisterEvent.ts';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';

export interface DesktopHeadingListItemProps {
  projectHeadingInfo: ProjectHeadingInfo;
  className?: string;
  taskList?: ITaskList;
  hideDividers?: boolean;
}

export const DesktopHeadingListItem: React.FC<DesktopHeadingListItemProps> = ({
  projectHeadingInfo,
  className,
  taskList,
  hideDividers,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: projectHeadingInfo.id,
  });
  const todoService = useService(ITodoService);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useWatchEvent(taskList?.onListStateChange);

  const isSelected = taskList?.selectedIds.includes(projectHeadingInfo.id) ?? false;
  const isFocused = taskList?.isFocused ?? false;

  const handleInputSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    if (!target || !taskList) {
      return;
    }
    taskList.updateCursor(target.selectionStart ?? 0);
    taskList.updateInputValue(target.value);
  };

  useRegisterEvent(taskList?.onFocusItem, (e) => {
    const inputElement = inputRef.current;
    if (e.id !== projectHeadingInfo.id || !inputElement) {
      return;
    }
    inputElement.focus({ preventScroll: true });
    inputElement.setSelectionRange(e.offset, e.offset);
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (taskList) {
      const projectHeadingId = projectHeadingInfo.id;
      taskList.select(projectHeadingId, {
        offset: null,
        multipleMode: e.metaKey,
      });
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classNames('group relative', {
        'bg-bg3 rounded-lg': isDragging,
        'pt-4': !hideDividers,
      })}
    >
      {!hideDividers && (
        <div
          className={classNames('h-px mb-4 shadow-[0_0.5px_0_0_theme(colors.line.bold)]', {
            'opacity-0': isDragging,
          })}
        ></div>
      )}
      <div
        className={classNames(
          'px-3 py-3 flex items-center gap-3 justify-between text-base leading-5 font-medium text-t1 rounded-lg transition-colors min-h-11 relative',
          {
            'bg-bg3': isFocused && isSelected && !isEditing,
            'bg-bg2': !isFocused && isSelected && !isEditing,
            'opacity-0': isDragging,
          },
          className
        )}
        onClickCapture={handleClickCapture}
        onClick={handleClick}
      >
        <DragHandleIcon className="absolute -left-5 top-1/2 -translate-y-1/2 size-5 text-t3 opacity-0 group-hover:opacity-50 transition-opacity z-10" />
        <HeadingIcon className="size-5 text-t1 flex-shrink-0" />
        <EditableInput
          ref={inputRef}
          inputKey={projectHeadingTitleInputKey(projectHeadingInfo.id)}
          defaultValue={projectHeadingInfo.title}
          onChange={(e) => {
            taskList?.updateInputValue(e.target.value);
          }}
          onSelect={handleInputSelect}
          onSave={(title: string) => {
            todoService.updateProjectHeading(projectHeadingInfo.id, { title });
            setIsEditing(false);
          }}
          onBlur={() => setIsEditing(false)}
          className="flex-1 bg-transparent outline-none text-t1 font-medium"
          placeholder="Project Heading"
        />
      </div>
    </div>
  );
};
