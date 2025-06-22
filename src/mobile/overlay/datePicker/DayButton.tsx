import { isToday } from '@/base/common/time';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import classNames from 'classnames';
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
  const isTodayValue = isToday(day.date);

  return (
    <button
      onClick={() => day.value && onSelect(day.date)}
      className={classNames(`${styles.datePickerDayButtonHeight} ${styles.datePickerDayButtonRound} text-sm relative`, {
        [`${styles.datePickerDaySelectedBackground} ${styles.datePickerDaySelectedTextColor}`]: day.isSelected,
        'opacity-0': !day.isCurrentMonth,
        [styles.datePickerTodayTextColor]: isTodayValue,
      })}
      disabled={!day.value}
    >
      {isTodayValue && (
        <span className="absolute top-0 left-0 w-full h-full flex items-start justify-center text-xs pt-1">
          {localize('date_picker.today', 'Today')}
        </span>
      )}
      {day.value || ''}
    </button>
  );
};
