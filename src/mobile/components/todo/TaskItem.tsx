import { TaskInfo } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useCancelEdit } from '@/hooks/useCancelEdit';
import { useExpandTransition } from '@/hooks/useExpandTransition';
import { MobileTestIds } from '@/mobile/testids';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { DragItem } from '../dnd/DragItem';
import { TaskItemDueDate } from '../taskItem/TaskItemDueDate';
import { TaskItemIcons } from '../taskItem/TaskItemIcons';
import { TaskItemSubtitle } from '../taskItem/TaskItemSubtitle';
import { TaskItemCompletionAt } from '../taskItem/taskItemCompletionAt';
import { TaskItemTitle } from '../taskItem/taskItemTitle';
import { EditTaskItem } from './EditTaskItem';
import { TaskStatusButton } from './TaskStatusButton';

interface TaskItemProps {
  taskInfo: TaskInfo;
  hideProjectTitle?: boolean;
  overlay?: boolean;
  className?: string;
  followParentArchiveState?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  taskInfo,
  hideProjectTitle = false,
  overlay = false,
  className,
  followParentArchiveState,
}) => {
  const todoService = useService(ITodoService);
  // overlay: rendered inside the DragOverlay as the item held in hand —
  // must not register as a sortable nor collapse into the DragItem placeholder.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, node } = useSortable({
    id: taskInfo.id,
    disabled: overlay || todoService.editingContent?.id === taskInfo.id,
  });
  const { isEditing, itemClassName, shouldIgnoreClick } = useCancelEdit(node, taskInfo.id);
  // Keep the edit content mounted while the collapse transition plays out.
  const { mounted: showEditContent, expanded, expandRef, handleTransitionEnd } = useExpandTransition(isEditing);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !overlay ? 0.5 : 1,
  };

  const isCompleted = taskInfo.status === 'completed';
  const isCanceled = taskInfo.status === 'canceled';

  const handleTaskClick = () => {
    todoService.editItem(taskInfo.id);
  };

  if (isDragging && !overlay) {
    return <DragItem ref={setNodeRef} attributes={attributes} listeners={listeners} style={style} />;
  }

  const collapsedRow = (
    <div className={classNames(styles.taskItemRoot, styles.taskItemGap)}>
      <TaskStatusButton
        taskId={taskInfo.id}
        status={taskInfo.status}
        className={styles.taskItemIconSize}
        testId={MobileTestIds.TaskItem.StatusBox}
      />
      <div className={styles.taskItemContent}>
        <div className={styles.taskItemTitleRow}>
          <TaskItemTitle
            testId={'task-item-title'}
            title={taskInfo.title}
            isCanceled={isCanceled}
            isCompleted={isCompleted}
            emptyText={localize('tasks.untitled', 'New Task')}
          />
          <div className={styles.homeProjectItemMetaIcons}>
            <TaskItemIcons tags={taskInfo.tags} notes={taskInfo.notes} subtasks={taskInfo.children} navIcon={false} />
          </div>
        </div>
        {taskInfo.projectTitle && !hideProjectTitle && (
          <TaskItemSubtitle title={taskInfo.projectTitle} hide={hideProjectTitle} />
        )}
      </div>
      <TaskItemCompletionAt completionAt={taskInfo.completionAt} status={taskInfo.status} />
      {taskInfo.status === 'created' && <TaskItemDueDate dueDate={taskInfo.dueDate} />}
    </div>
  );

  return (
    <div
      data-testid={isEditing ? MobileTestIds.EditTaskItem.Root : MobileTestIds.TaskItem.Root}
      className={classNames(
        styles.taskItemHeight,
        styles.taskItemPaddingX,
        // 过渡类仅在编辑生命周期内挂载：常驻会把拖拽排序时的瞬时背景/圆角切换放大成可见闪烁
        showEditContent && [styles.taskItemBackgroundTransition, styles.taskItemExpandDuration],
        itemClassName,
        isEditing
          ? [styles.listItemEditingBackground, styles.taskItemEditingShadow, styles.taskItemEditingRound]
          : [className, styles.listItemRound],
        {
          [styles.taskItemArchived]: !isEditing && followParentArchiveState && taskInfo.isParentArchived,
        }
      )}
      onClick={isEditing ? shouldIgnoreClick : handleTaskClick}
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(isEditing || overlay ? {} : attributes)}
      {...(isEditing || overlay ? {} : listeners)}
    >
      {showEditContent ? (
        <EditTaskItem
          taskInfo={taskInfo}
          expanded={expanded}
          expandRef={expandRef}
          closing={!isEditing}
          collapsedRow={collapsedRow}
          onCollapseTransitionEnd={handleTransitionEnd}
        />
      ) : (
        collapsedRow
      )}
    </div>
  );
};
