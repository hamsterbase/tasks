import { AreaIcon } from '@/components/icons';
import { ProjectIcon } from '@/desktop/components/todo/ProjectIcon';
import { desktopStyles } from '@/desktop/theme/main';
import { ItemStatus } from '@/core/type';
import { TestIds } from '@/testIds';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

interface TodayGroupHeaderProps {
  /**
   * Synthetic sortable id. The header is a real sortable node (same hook as
   * the project heading list item) so it reflows together with its group
   * while dragging. It is never a valid drag target/source for the grouped
   * Today actions, so picking it up is a harmless no-op.
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
      className={desktopStyles.TodayGroupHeader}
      data-testid={TestIds.TodayPage.GroupHeader}
      data-variant={variant}
    >
      <span className={desktopStyles.TodayGroupHeaderIcon}>
        {variant === 'area' ? (
          <AreaIcon className={desktopStyles.TodayGroupHeaderIconSvg} />
        ) : (
          <ProjectIcon size="md" status={projectStatus} progress={projectProgress} />
        )}
      </span>
      <h2 className={desktopStyles.TodayGroupHeaderTitle} data-testid={TestIds.TodayPage.GroupHeaderTitle}>
        {title}
      </h2>
    </div>
  );
};
