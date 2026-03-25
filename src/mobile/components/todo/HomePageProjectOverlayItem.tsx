import { ProjectInfoState } from '@/core/state/type.ts';
import { isPastOrToday } from '@/core/time/isPast';
import { formatDueDateInList } from '@/core/time/formatDueDateInList';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import classNames from 'classnames';
import React from 'react';
import { MobileProjectCheckbox } from '../icon/MobileProjectCheckbox';
import { FlagIcon } from '@/components/icons';

interface HomePageProjectOverlayItemProps {
  projectInfo: ProjectInfoState;
}

export const HomePageProjectOverlayItem: React.FC<HomePageProjectOverlayItemProps> = ({ projectInfo }) => {
  const isCompleted = projectInfo.status === 'completed';
  const isCanceled = projectInfo.status === 'canceled';

  return (
    <div className={styles.homeProjectItemRoot}>
      <div className={styles.homeProjectItemCheckboxContainer}>
        <MobileProjectCheckbox size="large" status={projectInfo.status} progress={projectInfo.progress * 100} />
      </div>
      <div className={styles.homeProjectItemContent}>
        <div className={styles.homeProjectItemTitleRow}>
          <span
            className={classNames(
              styles.homeProjectItemTitle,
              isCanceled
                ? styles.homeProjectItemTitleCompleted
                : isCompleted
                  ? styles.homeProjectItemTitleCanceled
                  : projectInfo.title
                    ? styles.homeProjectItemTitleNormal
                    : styles.homeProjectItemTitlePlaceholder
            )}
          >
            {projectInfo.title || localize('project.untitled', 'New Project')}
          </span>
        </div>
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
