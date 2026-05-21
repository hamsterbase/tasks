import { DragHandleIcon, NotesIcon } from '@/components/icons';
import { ITaskList } from '@/components/taskList/type.ts';
import { getProjectItemTags } from '@/core/state/getProjectItemTags';
import { ProjectInfoState } from '@/core/state/type';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useRegisterEvent } from '@/hooks/useRegisterEvent';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { TestIds } from '@/testIds';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React, { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ItemTagsList } from './ItemTagsList';
import { ProjectIcon } from './ProjectIcon';

interface SelectableProjectListItemProps {
  project: ProjectInfoState;
  taskList: ITaskList;
  hideProjectTitle?: boolean;
}

/**
 * Project row variant used when the row participates in a `taskList`
 * selection model (e.g. grouped Today): the first click selects the row
 * (meta+click toggles multi-select); clicking an already-singly-selected row
 * navigates to the project. This two-step interaction lets users browse with
 * the keyboard or build a multi-selection without being yanked off the page.
 *
 * For plain navigation contexts (flat Today, Inbox, project list, schedule,
 * completed, drag overlay) use {@link DesktopProjectListItem} instead.
 */
export const SelectableProjectListItem: React.FC<SelectableProjectListItemProps> = ({
  project,
  taskList,
  hideProjectTitle,
}) => {
  const progress = project.progress || 0;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: project.id,
  });

  const rowRef = useRef<HTMLDivElement | null>(null);
  const setRowRef = useCallback(
    (node: HTMLDivElement | null) => {
      rowRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.6 : 1,
    pointerEvents: (isDragging ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
  };

  const todoService = useService(ITodoService);
  const navigate = useNavigate();

  useWatchEvent(taskList.onListStateChange);
  const isSelected = taskList.selectedIds.includes(project.id);
  const isOnlySelection = isSelected && taskList.selectedIds.length === 1;
  const isFocused = taskList.isFocused;

  useRegisterEvent(taskList.onFocusItem, (e) => {
    if (e.id !== project.id) return;
    rowRef.current?.focus({ preventScroll: true });
    // Focusing the row drops the global InputFocused context to false, which
    // the list service reads as "user exited edit mode" and resets
    // _isEditing. Re-assert it so the next ArrowDown onto a task still
    // fires onFocusItem and refocuses the task's title input — without
    // this, navigating task → project → task silently lands on a selected
    // but non-editing row.
    taskList.setEditingState(true);
  });

  const tags = getProjectItemTags(todoService.modelState, {
    projectId: project.id,
    hideParent: hideProjectTitle ?? false,
  });

  return (
    <div
      ref={setRowRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={TestIds.ProjectListItem.Root}
      data-selected={isSelected ? 'true' : undefined}
      // Tabbable + focus on click so the surrounding ListContainer treats the
      // list as focused (otherwise keyboard commands like Enter wouldn't fire
      // after selecting a project, since divs aren't focusable by default).
      tabIndex={-1}
      onClick={(e) => {
        e.currentTarget.focus({ preventScroll: true });
        if (e.metaKey) {
          taskList.select(project.id, { offset: null, multipleMode: true });
          return;
        }
        if (isOnlySelection) {
          navigate(`/desktop/project/${project.uid}`);
          return;
        }
        taskList.select(project.id, { offset: null, multipleMode: false });
      }}
      className={classNames(desktopStyles.DesktopProjectListItemRow, {
        [desktopStyles.DesktopProjectListItemDragging]: isDragging,
        [desktopStyles.TaskListItemContainerSelected]: isSelected && isFocused && !isDragging,
        [desktopStyles.TaskListItemContainerSelectedInactive]: isSelected && !isFocused && !isDragging,
      })}
    >
      <DragHandleIcon className={desktopStyles.DesktopProjectListItemDragHandle} />
      <div
        className={desktopStyles.DesktopProjectListItemStatusBox}
        style={{ visibility: isDragging ? 'hidden' : 'visible' }}
      >
        <ProjectIcon
          progress={progress}
          status={project.status}
          size="md"
          className={desktopStyles.DesktopProjectListItemStatusBoxIcon}
        />
      </div>
      <div
        className={desktopStyles.DesktopProjectListItemContent}
        style={{ visibility: isDragging ? 'hidden' : 'visible' }}
      >
        <div className={desktopStyles.TaskListItemTitleRow}>
          <h3 className={desktopStyles.DesktopProjectListItemTitle} data-testid={TestIds.ProjectListItem.Title}>
            {project.title || localize('project.untitled', 'New Project')}
          </h3>
          {project.notes && <NotesIcon className={desktopStyles.TaskListItemIcon} />}
        </div>
        <ItemTagsList tags={tags} isSelected={false} />
      </div>
    </div>
  );
};
