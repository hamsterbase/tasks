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
import useNavigate from '@/hooks/useNavigate';
import { MobileProjectCheckbox } from '../icon/MobileProjectCheckbox';

interface ProjectItemProps {
  hideStartDate?: boolean;
  projectInfo: ProjectInfoState;
  hideSubtitle?: boolean;
  className?: string;
}

export const HomeProjectItem: React.FC<ProjectItemProps> = ({ projectInfo, hideSubtitle, className }) => {
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
  const titleNode = isEditing ? (
    <input
      {...textAreaProps}
      className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap bg-transparent text-base leading-6 font-medium outline-none"
    />
  ) : (
    <TaskItemTitle
      title={projectInfo.title}
      isCanceled={projectInfo.status === 'canceled'}
      isCompleted={projectInfo.status === 'completed'}
      emptyText={localize('project.untitled', 'New Project')}
    />
  );

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
        'flex items-start',
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
      <TaskItemStartDate
        hide={true}
        startDate={projectInfo.startDate}
        isCompleted={projectInfo.status === 'completed'}
      />
      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {titleNode}
          {!isEditing && (
            <>
              <div className="flex items-center gap-1 text-t3 shrink-0">
                <TaskItemIcons tags={projectInfo.tags} notes={projectInfo.notes} navIcon={false} />
              </div>
            </>
          )}
        </div>
        {!hideSubtitle && projectInfo.areaTitle && <TaskItemSubtitle title={projectInfo.areaTitle} />}
      </div>
      <TaskItemCompletionAt completionAt={projectInfo.completionAt} status={projectInfo.status} />
      {projectInfo.status === 'created' && <TaskItemDueDate dueDate={projectInfo.dueDate} />}
    </div>
  );
};
