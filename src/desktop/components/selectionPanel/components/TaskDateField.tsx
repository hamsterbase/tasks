import { formatDate } from '@/core/time/formatDate';
import { formatRemainingDays } from '@/core/time/formatRemainingDays';
import { isPastOrToday } from '@/core/time/isPast';
import { localize } from '@/nls';
import classNames from 'classnames';
import React from 'react';

interface TaskDateFieldProps {
  label: string;
  icon: React.ReactNode;
  date?: number;
  onDateClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClearDate?: (e: React.MouseEvent) => void;
  isDue?: boolean;
}

export const TaskDateField: React.FC<TaskDateFieldProps> = ({
  label,
  icon,
  date,
  onDateClick,
  onClearDate,
  isDue = false,
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-t2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {date ? (
          <div className="flex items-baseline gap-2">
            <button
              onClick={onDateClick}
              className={classNames('text-sm hover:bg-bg2 px-2 py-1 rounded transition-colors', {
                'text-stress-red': isDue && isPastOrToday(date),
                'text-t1': !isDue || !isPastOrToday(date),
              })}
            >
              {formatDate(date)}
            </button>
            <span className="text-xs text-t2">{formatRemainingDays(date)}</span>
          </div>
        ) : (
          <button
            onClick={onDateClick}
            className="text-sm text-t1 hover:bg-bg2 px-2 py-1 rounded transition-colors"
          >
            {localize('tasks.set_date', 'Set date')}
          </button>
        )}
        {date && onClearDate && (
          <button
            onClick={onClearDate}
            className="text-xs text-t3 hover:text-t1 px-1 transition-colors"
            title={localize('tasks.clear_date', 'Clear date')}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};