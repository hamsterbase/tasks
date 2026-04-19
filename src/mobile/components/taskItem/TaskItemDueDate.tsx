import { isPastOrToday } from '@/core/time/isPast';
import { formatDueDateInList } from '@/core/time/formatDueDateInList';
import { FlagIcon } from '@/components/icons';
import { styles } from '@/mobile/theme';
import classNames from 'classnames';
import React from 'react';

interface TaskItemDueDateProps {
  dueDate?: number;
}

export const TaskItemDueDate: React.FC<TaskItemDueDateProps> = ({ dueDate }) => {
  if (!dueDate) {
    return null;
  }
  return (
    <div
      className={classNames(styles.homeProjectItemDueDate, {
        [styles.homeProjectItemDueDateOverdue]: isPastOrToday(dueDate),
        [styles.homeProjectItemDueDateNormal]: !isPastOrToday(dueDate),
      })}
    >
      <FlagIcon className={styles.homeProjectItemDueDateIconSize} strokeWidth={1.5} />
      {formatDueDateInList(dueDate)}
    </div>
  );
};
