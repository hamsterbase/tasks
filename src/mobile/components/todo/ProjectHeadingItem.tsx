import { MenuIcon } from '@/components/icons';
import { ProjectHeadingInfo } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useCancelEdit } from '@/hooks/useCancelEdit';
import { useEdit } from '@/hooks/useEdit';
import { useProjectHeader } from '@/hooks/useProjectHeader';
import { styles } from '@/mobile/theme';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { DragItem } from '../dnd/DragItem';

export interface ProjectHeadingItemProps {
  projectHeadingInfo: ProjectHeadingInfo;
  className?: string;
}

export const ProjectHeadingItem: React.FC<ProjectHeadingItemProps> = ({ projectHeadingInfo, className }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, node } = useSortable({
    id: projectHeadingInfo.id,
  });
  const todoService = useService(ITodoService);
  const { itemClassName, shouldIgnoreClick, isEditing, endEditing } = useCancelEdit(node, projectHeadingInfo.id);
  const { textAreaProps } = useEdit({
    isEditing,
    title: projectHeadingInfo.title,
    onSave: (title: string) => {
      todoService.updateProjectHeading(projectHeadingInfo.id, { title });
    },
    singleLine: true,
    onConfirm: endEditing,
  });
  const { handleMenuClick } = useProjectHeader({ projectHeadingInfo });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  if (isDragging) {
    return <DragItem ref={setNodeRef} attributes={attributes} listeners={listeners} style={style} />;
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.projectHeadingItemSpacingTop}>
      <div
        className={classNames(
          styles.taskItemPaddingX,
          styles.taskItemHeight,
          styles.listItemRound,
          itemClassName,
          styles.projectHeadingItemRow,
          {
            [styles.projectHeadingItemArchived]: projectHeadingInfo.isArchived,
            [styles.listItemEditingBackground]: isEditing,
          },
          className
        )}
        onClick={shouldIgnoreClick}
      >
        {isEditing ? (
          <input {...textAreaProps} className={styles.projectHeadingItemEditingInput} />
        ) : (
          <span className={styles.projectHeadingItemLabel}>{projectHeadingInfo.title}</span>
        )}
        <button className={styles.projectHeadingItemMenuButton} onClick={handleMenuClick}>
          <MenuIcon className={styles.projectHeadingItemMenuIcon} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};
