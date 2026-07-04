import { AreaIcon } from '@/components/icons';
import { ItemStatus } from '@/core/type';
import { styles } from '@/mobile/theme';
import { TestIds } from '@/testIds';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { MobileProjectCheckbox } from '../icon/MobileProjectCheckbox';

interface TodayGroupHeaderProps {
  /**
   * Synthetic sortable id. The header is a real sortable node so it reflows
   * together with its group while dragging, and serves as a drop target that
   * means "into this group" for the grouped Today drag actions.
   */
  id: string;
  title: string;
  variant: 'area' | 'project';
  projectStatus?: ItemStatus;
  projectProgress?: number;
}

export const TodayGroupHeader: React.FC<TodayGroupHeaderProps> = ({
  id,
  title,
  variant,
  projectStatus,
  projectProgress,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.todayGroupHeaderRoot}
      data-testid={TestIds.TodayPage.GroupHeader}
      data-variant={variant}
    >
      <span className={styles.todayGroupHeaderIcon}>
        {variant === 'area' ? (
          <AreaIcon className={styles.areaHeaderIconSize} strokeWidth={1.5} />
        ) : (
          <MobileProjectCheckbox status={projectStatus} progress={projectProgress} />
        )}
      </span>
      <span className={styles.todayGroupHeaderTitle} data-testid={TestIds.TodayPage.GroupHeaderTitle}>
        {title}
      </span>
    </div>
  );
};
