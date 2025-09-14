import { DueIcon } from '@/components/icons';
import { formatDate } from '@/core/time/formatDate';
import { formatRemainingDays } from '@/core/time/formatRemainingDays';
import { isPastOrToday } from '@/core/time/isPast';
import { localize } from '@/nls';
import classNames from 'classnames';
import React from 'react';

interface DueDateInfoItemProps {
  dueDate?: number;
}

export const DueDateInfoItem: React.FC<DueDateInfoItemProps> = ({ dueDate }) => {
  return (
    <p className="flex items-baseline gap-2">
      <span
        className={classNames({
          'text-stress-red': isPastOrToday(dueDate),
        })}
      >
        {localize('create_task_page.due_date', 'Due Date')}: {formatDate(dueDate)}
      </span>
      <span className="text-sm text-t2"> {formatRemainingDays(dueDate)}</span>
    </p>
  );
};

export const DueDateInfoItemIcon: React.FC<DueDateInfoItemProps> = ({ dueDate }) => {
  return (
    <DueIcon
      className={classNames({
        'text-stress-red': isPastOrToday(dueDate),
      })}
    />
  );
};
