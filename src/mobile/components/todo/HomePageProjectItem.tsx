import { ProjectInfoState } from '@/core/state/type.ts';
import { isPastOrToday } from '@/core/time/isPast';
import { formatDueDateInList } from '@/core/time/formatDueDateInList';
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
import { MobileProjectCheckbox } from '../icon/MobileProjectCheckbox';
import useNavigate from '@/hooks/useNavigate';
import { FlagIcon } from '@/components/icons';
import { getItemStatusVisual, itemToneClass } from '@/components/todo/itemStatusVisual';
import { useItemStatusAnimation } from '@/hooks/useItemStatusAnimation';

interface HomePageProjectItemProps {
  projectInfo: ProjectInfoState;
  className?: string;
}

export const HomePageProjectItem: React.FC<HomePageProjectItemProps> = ({ projectInfo, className }) => {
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
  const animationPhase = useItemStatusAnimation(projectInfo.status);
  const visual = getItemStatusVisual(projectInfo.status);

  if (isDragging) {
    return <DragItem ref={setNodeRef} attributes={attributes} listeners={listeners} style={style} />;
  }

  const titleNode = isEditing ? (
    <input {...textAreaProps} className={styles.homeProjectItemEditingInput} />
  ) : (
    <span
      className={classNames(
        styles.homeProjectItemTitle,
        projectInfo.title ? itemToneClass(visual.titleTone) : styles.homeProjectItemTitlePlaceholder,
        visual.closed && 'item-status-title-closed item-status-title-animated',
        animationPhase === 'reverting' && 'item-status-title-reverting'
      )}
    >
      {projectInfo.title || localize('project.untitled', 'New Project')}
    </span>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classNames(styles.homeProjectItemRoot, itemClassName, className, {
        [styles.taskItemEditingShadow]: isEditing,
        [styles.taskItemEditingRound]: isEditing,
      })}
      onClick={(e) => {
        if (shouldIgnoreClick(e)) return;
        navigate({ path: `/project/${projectInfo.uid}` });
      }}
      data-status={projectInfo.status}
      data-status-animation={animationPhase}
    >
      <div className={styles.homeProjectItemCheckboxContainer}>
        <MobileProjectCheckbox
          size="large"
          status={projectInfo.status}
          progress={projectInfo.progress * 100}
          animationPhase={animationPhase}
        />
      </div>
      <div className={styles.homeProjectItemContent}>
        <div className={styles.homeProjectItemTitleRow}>{titleNode}</div>
      </div>
      {projectInfo.status === 'created' && projectInfo.dueDate && (
        <span
          className={classNames(
            styles.homeProjectItemDueDate,
            isPastOrToday(projectInfo.dueDate)
              ? styles.homeProjectItemDueDateOverdue
              : styles.homeProjectItemDueDateNormal
          )}
        >
          <FlagIcon className={styles.homeProjectItemDueDateIconSize} strokeWidth={1.5} />
          {formatDueDateInList(projectInfo.dueDate)}
        </span>
      )}
    </div>
  );
};
