import { EditableInput } from '@/components/edit/EditableInput';
import { projectHeadingTitleInputKey } from '@/components/edit/inputKeys';
import { HeadingIcon, MenuIcon } from '@/components/icons';
import { ITaskList } from '@/components/taskList/type.ts';
import { ProjectHeadingInfo } from '@/core/state/type.ts';
import { desktopStyles } from '@/desktop/theme/main';
import { useDesktopProjectHeader } from '@/desktop/hooks/useDesktopProjectHeader';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useRegisterEvent } from '@/hooks/useRegisterEvent.ts';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';

export interface DesktopProjectHeadingItemProps {
  projectHeadingInfo: ProjectHeadingInfo;
  className?: string;
  taskList?: ITaskList;
}

export const DesktopProjectHeadingItem: React.FC<DesktopProjectHeadingItemProps> = ({
  projectHeadingInfo,
  className,
  taskList,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: projectHeadingInfo.id,
  });
  const todoService = useService(ITodoService);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleMenuClick } = useDesktopProjectHeader({ projectHeadingInfo });

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

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={desktopStyles.ProjectHeadingItemDragging}
      >
        {projectHeadingInfo.title}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={desktopStyles.ProjectHeadingItemWrapper}
    >
      <div
        className={classNames(
          desktopStyles.ProjectHeadingItemContainer,
          {
            [desktopStyles.ProjectHeadingItemContainerSelected]: (isFocused && isSelected) || isEditing,
            [desktopStyles.ProjectHeadingItemContainerSelectedInactive]: !isFocused && isSelected,
          },
          className
        )}
        onClickCapture={(e) => {
          if (taskList) {
            const projectHeadingId = projectHeadingInfo.id;
            if (e.metaKey) {
              taskList.select(projectHeadingId, {
                offset: null,
                multipleMode: true,
              });
            } else {
              taskList.select(projectHeadingId, {
                offset: null,
                multipleMode: false,
              });
            }
          }
        }}
        onClick={() => {
          if (!isEditing) {
            setIsEditing(true);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 0);
          }
        }}
      >
        <div className={desktopStyles.ProjectHeadingItemContent}>
          <HeadingIcon className={desktopStyles.ProjectHeadingItemIcon} />
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
            className={desktopStyles.ProjectHeadingItemInput}
            placeholder="Project Heading"
          />
        </div>
        <MenuIcon onClick={handleMenuClick} className={desktopStyles.ProjectHeadingItemMenuIcon} />
      </div>
    </div>
  );
};
