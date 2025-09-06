import { EditableInputSpan } from '@/components/edit/EditableInputSpan';
import { projectHeadingTitleInputKey } from '@/components/edit/inputKeys';
import { DragHandleIcon, HeadingIcon } from '@/components/icons';
import { ITaskList } from '@/components/taskList/type.ts';
import { ProjectHeadingInfo } from '@/core/state/type.ts';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useSync } from '@/hooks/use-sync';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useContextKeyValue } from '@/hooks/useContextKeyValue';
import { useRegisterEvent } from '@/hooks/useRegisterEvent.ts';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { InputFocusedContext } from 'vscf/platform/contextkey/common';

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
  const inputRef = useRef<HTMLInputElement>(null);

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

  useWatchEvent(taskList?.onListStateChange);

  const isSelected = taskList?.selectedIds.includes(projectHeadingInfo.id) ?? false;
  const isFocused = taskList?.isFocused ?? false;

  const isInputFocused = useContextKeyValue(InputFocusedContext);
  const handleStartEdit = (_value: string, cursor: number) => {
    if (!taskList) {
      return;
    }
    if (taskList.cursorId === projectHeadingInfo.id) {
      if (taskList.cursorOffset !== null) {
        if (isInputFocused) {
          return;
        }
      }
    }
    taskList.select(projectHeadingInfo.id, {
      offset: cursor,
      multipleMode: false,
      fireEditEvent: true,
    });
  };

  const sync = useSync();
  useRegisterEvent(taskList?.onFocusItem, (e) => {
    const inputElement = inputRef.current;
    if (e.id !== projectHeadingInfo.id) {
      return;
    }
    sync();
    if (!inputElement) {
      const inputElement = inputRef.current as HTMLInputElement | null;
      inputElement?.focus({ preventScroll: true });
      inputElement?.setSelectionRange(e.offset, e.offset);
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...dragListeners}
      className={classNames(desktopStyles.DesktopHeadingListItemContainer, {
        [desktopStyles.DesktopHeadingListItemContainerDragging]: isDragging,
        [desktopStyles.DesktopHeadingListItemContainerPadding]: !hideDividers,
      })}
    >
      {!hideDividers && (
        <div
          className={classNames(desktopStyles.DesktopHeadingListItemDivider, {
            [desktopStyles.DesktopHeadingListItemDividerHidden]: isDragging,
          })}
        ></div>
      )}
      <div
        className={classNames(
          desktopStyles.DesktopHeadingListItemContent,
          {
            [desktopStyles.DesktopHeadingListItemContentFocused]: isFocused && isSelected && !isInputFocused,
            [desktopStyles.DesktopHeadingListItemContentSelected]: !isFocused && isSelected,
            [desktopStyles.DesktopHeadingListItemContentHidden]: isDragging,
            [desktopStyles.DesktopHeadingListItemContentEditing]: isFocused && isSelected && isInputFocused,
          },
          className
        )}
        onClickCapture={handleClickCapture}
      >
        <DragHandleIcon className={desktopStyles.DesktopHeadingListItemDragHandle} />
        <HeadingIcon className={desktopStyles.DesktopHeadingListItemIcon} />
        <EditableInputSpan
          ref={inputRef}
          inputKey={projectHeadingTitleInputKey(projectHeadingInfo.id)}
          defaultValue={projectHeadingInfo.title}
          onChange={(e) => {
            taskList?.updateInputValue(e.target.value);
          }}
          isFocused={isSelected}
          onStartEdit={handleStartEdit}
          onSave={(title: string) => {
            todoService.updateProjectHeading(projectHeadingInfo.id, { title });
          }}
          className={desktopStyles.DesktopHeadingListItemInput}
          placeholder="Project Heading"
        />
      </div>
    </div>
  );
};
