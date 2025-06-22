import { getCurrentDateStr } from '@/base/common/time';
import { localize } from '@/nls';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React from 'react';

interface DayButtonProps {
  day: {
    date: Date;
    value: number | null;
    isCurrentMonth: boolean;
    isSelected: boolean;
  };
  onSelect: (date: Date) => void;
}

export const DayButton: React.FC<DayButtonProps> = ({ day, onSelect }) => {
  const isToday = getCurrentDateStr() === dayjs(day.date).format('YYYY-MM-DD');

  return (
    <button
      onClick={() => day.value && onSelect(day.date)}
      className={classNames('h-6 w-6 rounded text-xs relative hover:bg-bg2 transition-colors', {
        'bg-brand text-white': day.isSelected,
        'opacity-30': !day.isCurrentMonth,
        'text-brand font-bold': isToday && !day.isSelected,
        'text-t1': day.isCurrentMonth && !isToday && !day.isSelected,
      })}
      disabled={!day.value}
    >
      {isToday && !day.isSelected ? (
        <span className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs">
          {localize('date_picker.today', 'Today')}
        </span>
      ) : (
        day.value || ''
      )}
    </button>
  );
};
