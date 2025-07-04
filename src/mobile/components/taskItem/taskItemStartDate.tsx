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
  return <span className="text-xs text-t3 bg-bg2 p-1 rounded-sm">{formatStartDateInList(startDate)}</span>;
};
