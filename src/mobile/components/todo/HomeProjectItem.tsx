import { ProjectInfoState } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useCancelEdit } from '@/hooks/useCancelEdit';
import { useEdit } from '@/hooks/useEdit';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { DragItem } from '../dnd/DragItem';
import { TaskItemCompletionAt } from '../taskItem/taskItemCompletionAt';
import { TaskItemDueDate } from '../taskItem/TaskItemDueDate';
import { TaskItemIcons } from '../taskItem/TaskItemIcons';
import { TaskItemStartDate } from '../taskItem/taskItemStartDate';
import { TaskItemSubtitle } from '../taskItem/TaskItemSubtitle';
import { TaskItemTitle } from '../taskItem/taskItemTitle';
import { TaskItemTitleAndSubtitle } from '../taskItem/TaskItemTitleAndSubtitle';
import useNavigate from '@/hooks/useNavigate';
import { MobileProjectCheckbox } from '../icon/MobileProjectCheckbox';

interface ProjectItemProps {
  hideStartDate?: boolean;
  hideNavIcon?: boolean;
  projectInfo: ProjectInfoState;
  hideSubtitle?: boolean;
  className?: string;
}

export const HomeProjectItem: React.FC<ProjectItemProps> = ({
  projectInfo,
  hideStartDate,
  hideNavIcon,
  hideSubtitle,
  className,
}) => {
  const navigate = useNavigate();
  const todoService = useService(ITodoService);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, node } = useSortable({
    id: projectInfo.id,
  });
  const { itemClassName, shouldIgnoreClick, isEditing, endEditing } = useCancelEdit(node, projectInfo.id);
  const { textAreaProps } = useEdit({
    isEditing,
    title: projectInfo.title,
    onSave: (title: string) => {
      todoService.updateProject(projectInfo.id, { title });
    },
    singleLine: true,
    onConfirm: endEditing,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isDragging) {
    return <DragItem ref={setNodeRef} attributes={attributes} listeners={listeners} style={style} />;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classNames(
        'flex items-center',
        styles.taskItemPaddingX,
        styles.taskItemHeight,
        styles.taskItemGap,
        itemClassName,
        className,
        {
          [styles.taskItemEditingShadow]: isEditing,
          [styles.taskItemEditingRound]: isEditing,
        }
      )}
      onClick={(e) => {
        if (shouldIgnoreClick(e)) {
          return;
        }
        navigate({ path: `/project/${projectInfo.uid}` });
      }}
    >
      <button className={classNames(styles.taskItemIconSize)}>
        <MobileProjectCheckbox status={projectInfo.status} progress={projectInfo.progress} />
      </button>
      <TaskItemCompletionAt completionAt={projectInfo.completionAt} status={projectInfo.status} />
      <TaskItemStartDate
        hide={hideStartDate}
        startDate={projectInfo.startDate}
        isCompleted={projectInfo.status === 'completed'}
      />
      <TaskItemTitleAndSubtitle
        hideSubtitle={hideSubtitle}
        status={projectInfo.status}
        dueDate={<TaskItemDueDate dueDate={projectInfo.dueDate} />}
        title={
          isEditing ? (
            <input
              {...textAreaProps}
              className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap bg-transparent text-lg outline-none"
            />
          ) : (
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-lg flex items-baseline gap-1">
              <TaskItemTitle
                title={projectInfo.title}
                isCanceled={projectInfo.status === 'canceled'}
                emptyText={localize('project.untitled', 'New Project')}
              />
              {!hideNavIcon && <TaskItemIcons tags={projectInfo.tags} notes={projectInfo.notes} navIcon={true} />}
            </span>
          )
        }
        subtitle={projectInfo.areaTitle ? <TaskItemSubtitle title={projectInfo.areaTitle} /> : null}
      />
    </div>
  );
};
