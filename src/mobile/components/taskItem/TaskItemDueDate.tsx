import { isPastOrToday } from '@/core/time/isPast';
import { formatDueDateInList } from '@/core/time/formatDueDateInList';
import { DueIcon } from '@/components/icons';
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
      className={classNames('text-xs font-semibold leading-6 flex items-center gap-1', {
        'text-accent-danger': isPastOrToday(dueDate),
        'text-t2': !isPastOrToday(dueDate),
      })}
    >
      <DueIcon className="size-3" strokeWidth={1.5} />
      {formatDueDateInList(dueDate)}
    </div>
  );
};
