import { DueIcon } from '@/components/icons';
import { formatDueDateInList } from '@/core/time/formatDueDateInList';
import { isPastOrToday } from '@/core/time/isPast';
import classNames from 'classnames';
import React from 'react';

export const TaskItemDueDate: React.FC<{ dueDate?: number }> = ({ dueDate }) => {
  if (!dueDate) {
    return null;
  }
  return (
    <div
      className={classNames('text-xs flex items-center gap-0.5 flex-shrink-0', {
        'text-stress-red': isPastOrToday(dueDate),
        'text-t3': !isPastOrToday(dueDate),
      })}
    >
      <DueIcon className="size-3" />
      {formatDueDateInList(dueDate)}
    </div>
  );
};
