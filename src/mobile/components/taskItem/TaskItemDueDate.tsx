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
      className={classNames('text-xs flex items-center gap-0.5 flex-shrink-0', {
        'text-accent-danger': isPastOrToday(dueDate),
        'text-t3': !isPastOrToday(dueDate),
      })}
    >
      <DueIcon className="size-3"></DueIcon>
      {formatDueDateInList(dueDate)}
    </div>
  );
};
