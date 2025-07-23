import { DueIcon } from '@/components/icons';
import { formatDueDateInList } from '@/core/time/formatDueDateInList';
import { isPastOrToday } from '@/core/time/isPast';
import classNames from 'classnames';
import React from 'react';

export const TaskItemDueDate: React.FC<{ dueDate?: number; hideIcon?: boolean; textColor?: string | null }> = ({
  dueDate,
  hideIcon = false,
  textColor,
}) => {
  if (!dueDate) {
    return null;
  }
  const colorClass = textColor || (isPastOrToday(dueDate) ? 'text-stress-red' : 'text-t3');
  return (
    <div className={classNames('text-xs flex items-center gap-0.5 flex-shrink-0', colorClass)}>
      {!hideIcon && <DueIcon className="size-3" />}
      {formatDueDateInList(dueDate)}
    </div>
  );
};
