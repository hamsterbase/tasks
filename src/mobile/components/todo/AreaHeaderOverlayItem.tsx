import { AreaExpandedIcon, AreaIcon } from '@/components/icons';
import { AreaInfoState } from '@/core/state/type';
import { useConfig } from '@/hooks/useConfig';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { toggleAreaConfigKey } from '@/services/config/config';
import classNames from 'classnames';
import React from 'react';

interface AreaHeaderOverlayItemProps {
  areaInfo: AreaInfoState;
}

/**
 * Drag-overlay variant of AreaHeader. The list AreaHeader wraps itself in the
 * card-gap padding (taskItemGroupHeaderPadding), which inside the overlay pill
 * would show up as an empty strip above the row — so the overlay renders the
 * bare row only.
 */
export const AreaHeaderOverlayItem: React.FC<AreaHeaderOverlayItemProps> = ({ areaInfo }) => {
  const { value: config } = useConfig(toggleAreaConfigKey());
  const isExpanded = !config.includes(areaInfo.id);

  return (
    <div className={classNames(styles.areaHeaderRoot, styles.listItemRound)}>
      <span className={styles.areaHeaderIconContainer}>
        <AreaIcon className={styles.areaHeaderIconSize} strokeWidth={1.5} />
      </span>
      <div className={styles.areaHeaderTitle}>
        <span
          className={classNames(
            styles.homeProjectItemTitle,
            areaInfo.title ? styles.homeProjectItemTitleNormal : styles.homeProjectItemTitlePlaceholder
          )}
        >
          {areaInfo.title || localize('area.untitled', 'New Area')}
        </span>
      </div>
      <span className={styles.areaHeaderArrowContainer}>
        <AreaExpandedIcon
          className={classNames(styles.areaHeaderArrowSize, 'transition-transform', isExpanded ? 'rotate-90' : '')}
          strokeWidth={1.5}
        />
      </span>
    </div>
  );
};
