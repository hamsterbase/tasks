import { MenuIcon } from '@/components/icons';
import { ProjectHeadingInfo } from '@/core/state/type.ts';
import { styles } from '@/mobile/theme';
import classNames from 'classnames';
import React from 'react';

interface ProjectHeadingOverlayItemProps {
  projectHeadingInfo: ProjectHeadingInfo;
}

/**
 * Drag-overlay variant of ProjectHeadingItem. The list item wraps itself in
 * the card-gap padding (projectHeadingItemSpacingTop), which inside the
 * overlay pill would show up as an empty strip above the row — so the overlay
 * renders the bare row only.
 */
export const ProjectHeadingOverlayItem: React.FC<ProjectHeadingOverlayItemProps> = ({ projectHeadingInfo }) => {
  return (
    <div
      className={classNames(
        styles.taskItemPaddingX,
        styles.taskItemHeight,
        styles.listItemRound,
        styles.projectHeadingItemRow,
        {
          [styles.projectHeadingItemArchived]: projectHeadingInfo.isArchived,
        }
      )}
    >
      <span className={styles.projectHeadingItemLabel}>{projectHeadingInfo.title}</span>
      <button className={styles.projectHeadingItemMenuButton}>
        <MenuIcon className={styles.projectHeadingItemMenuIcon} strokeWidth={1.5} />
      </button>
    </div>
  );
};
