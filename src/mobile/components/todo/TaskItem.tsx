import { TaskInfo } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useCancelEdit } from '@/hooks/useCancelEdit';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { styles } from '@/mobile/theme';
import { ITodoService } from '@/services/todo/common/todoService';
import { localize } from '@/nls';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { DragItem } from '../dnd/DragItem';
import { TaskItemDueDate } from '../taskItem/TaskItemDueDate';
import { TaskItemIcons } from '../taskItem/TaskItemIcons';
import { TaskItemSubtitle } from '../taskItem/TaskItemSubtitle';
import { TaskItemTitleAndSubtitle } from '../taskItem/TaskItemTitleAndSubtitle';
import { TaskStatusBox } from '../taskItem/TaskStatusBox';
import { TaskItemCompletionAt } from '../taskItem/taskItemCompletionAt';
import { TaskItemStartDate } from '../taskItem/taskItemStartDate';
import { TaskItemTitle } from '../taskItem/taskItemTitle';
import { EditTaskItem } from './EditTaskItem';
import { useLongPress } from '@/hooks/useLongPress';

interface TaskItemProps {
  taskInfo: TaskInfo;
  hideProjectTitle?: boolean;
  overlay?: boolean;
  hideStartDate?: boolean;
  className?: string;
  followParentArchiveState?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  taskInfo,
  hideProjectTitle = false,
  hideStartDate = false,
  className,
  followParentArchiveState,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, node } = useSortable({
    id: taskInfo.id,
  });
  const { isEditing } = useCancelEdit(node, taskInfo.id);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const todoService = useService(ITodoService);
  const popupAction = usePopupAction();
  const isCompleted = taskInfo.status === 'completed';
  const isCanceled = taskInfo.status === 'canceled';

  const handleLongPress = () => {
    popupAction({
      groups: [
        {
          items: [
            {
              condition: taskInfo.status !== 'created',
              icon: <TaskStatusBox status={'created'} />,
              name: localize('tasks.mark_as_created', 'Mark as Created'),
              onClick: () => {
                todoService.updateTask(taskInfo.id, { status: 'created' });
              },
            },
            {
              condition: taskInfo.status !== 'completed',
              icon: <TaskStatusBox status={'completed'} />,
              name: localize('tasks.mark_as_completed', 'Mark as Completed'),
              onClick: () => {
                todoService.updateTask(taskInfo.id, { status: 'completed' });
              },
            },
            {
              condition: taskInfo.status !== 'canceled',
              icon: <TaskStatusBox status={'canceled'} />,
              name: localize('tasks.mark_as_canceled', 'Mark as Canceled'),
              onClick: () => {
                todoService.updateTask(taskInfo.id, { status: 'canceled' });
              },
            },
          ],
        },
      ],
    });
  };

  const { longPressEvents } = useLongPress(handleLongPress);

  const toggleTask = () => {
    if (taskInfo.status !== 'created') {
      todoService.updateTask(taskInfo.id, { status: 'created' });
    } else {
      todoService.updateTask(taskInfo.id, { status: 'completed' });
    }
  };
  const handleTaskClick = () => {
    todoService.editItem(taskInfo.id);
  };

  if (isDragging) {
    return <DragItem ref={setNodeRef} attributes={attributes} listeners={listeners} style={style} />;
  }
  if (isEditing) {
    return <EditTaskItem taskInfo={taskInfo} />;
  }
  return (
    <div
      data-testid="task-item"
      className={classNames('flex items-center', className, {
        [styles.listItemRound]: true,
        [styles.taskItemHeight]: true,
        [styles.listItemEditingBackground]: isEditing,
        [styles.taskItemEditingRound]: isEditing,
        [styles.taskItemPaddingX]: true,
        [styles.taskItemGap]: true,
        'opacity-50!': followParentArchiveState && taskInfo.isParentArchived,
      })}
      onClick={handleTaskClick}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <button
        data-testid="task-item-status-box"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleTask();
        }}
        {...longPressEvents}
        className={classNames(styles.taskItemIconSize)}
      >
        <TaskStatusBox
          className={classNames({
            'text-brand': isCompleted,
            'text-t3': !isCompleted,
          })}
          status={taskInfo.status}
        />
      </button>
      <TaskItemCompletionAt completionAt={taskInfo.completionAt} status={taskInfo.status} />
      <TaskItemStartDate hide={hideStartDate} startDate={taskInfo.startDate} isCompleted={isCompleted} />
      <TaskItemTitleAndSubtitle
        status={taskInfo.status}
        dueDate={<TaskItemDueDate dueDate={taskInfo.dueDate} />}
        title={
          <div className="flex items-center gap-1 flex-1 overflow-hidden">
            <TaskItemTitle
              testId={'task-item-title'}
              title={taskInfo.title}
              isCanceled={isCanceled}
              emptyText={localize('tasks.untitled', 'New Task')}
            />
            <TaskItemIcons tags={taskInfo.tags} notes={taskInfo.notes} subtasks={taskInfo.children} navIcon={false} />
          </div>
        }
        subtitle={
          taskInfo.projectTitle && !hideProjectTitle ? (
            <TaskItemSubtitle title={taskInfo.projectTitle} hide={hideProjectTitle} />
          ) : null
        }
      />
    </div>
  );
};
