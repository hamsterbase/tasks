import { CalendarIcon } from '@/components/icons';
import { formatStartDateInList } from '@/core/time/formatStartDateInList';
import { isPastOrToday } from '@/core/time/isPast';
import React from 'react';

interface TaskItemStartDateProps {
  startDate?: number;
  isCompleted: boolean;
  hide?: boolean;
}

export const TaskItemStartDate: React.FC<TaskItemStartDateProps> = ({ startDate, isCompleted, hide }) => {
  if (!startDate || isPastOrToday(startDate) || isCompleted || hide) {
    return null;
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-t3 shrink-0">
      <CalendarIcon className="size-3" strokeWidth={1.5} />
      {formatStartDateInList(startDate)}
    </span>
  );
};
