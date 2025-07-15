import { formatStartDateInList } from '@/core/time/formatStartDateInList';
import { isPastOrToday } from '@/core/time/isPast';
import React from 'react';

export const TaskItemStartDate: React.FC<{ startDate?: number }> = ({ startDate }) => {
  if (!startDate || isPastOrToday(startDate)) {
    return null;
  }
  return <div className="text-xs text-t3 bg-bg2 p-1 rounded-sm">{formatStartDateInList(startDate)}</div>;
};
