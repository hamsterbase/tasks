import { DueIcon } from '@/components/icons';
import { formatDate } from '@/core/time/formatDate';
import { formatRemainingDays } from '@/core/time/formatRemainingDays';
import { isPastOrToday } from '@/core/time/isPast';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import classNames from 'classnames';
import React from 'react';

interface DueDateInfoItemProps {
  dueDate?: number;
}

export const DueDateInfoItem: React.FC<DueDateInfoItemProps> = ({ dueDate }) => {
  return (
    <p className={styles.infoItemBaselineRow}>
      <span
        className={classNames({
          'text-accent-danger': isPastOrToday(dueDate),
        })}
      >
        {localize('create_task_page.due_date', 'Due Date')}: {formatDate(dueDate)}
      </span>
      <span className={styles.formHintText}> {formatRemainingDays(dueDate)}</span>
    </p>
  );
};

export const DueDateInfoItemIcon: React.FC<DueDateInfoItemProps> = ({ dueDate }) => {
  return (
    <DueIcon
      className={classNames({
        'text-accent-danger': isPastOrToday(dueDate),
      })}
    />
  );
};
