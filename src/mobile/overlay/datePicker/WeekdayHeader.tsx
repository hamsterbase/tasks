import { getCalendarWeekdayLabels, type CalendarWeekStartDay } from '@/core/time/calendarWeekStart';
import { styles } from '@/mobile/theme';
import React from 'react';

interface WeekdayHeaderProps {
  weekStartDay: CalendarWeekStartDay;
}

export const WeekdayHeader: React.FC<WeekdayHeaderProps> = ({ weekStartDay }) => {
  const weekdays = getCalendarWeekdayLabels(weekStartDay);

  return (
    <div
      className={`grid grid-cols-7 gap-1 py-2 ${styles.datePickerContentPadding} sticky top-0 ${styles.datePickerBackground}`}
    >
      {weekdays.map((day) => (
        <div
          key={day}
          className={`text-center ${styles.datePickerWeekdayTextSize} ${styles.datePickerWeekdayTextColor}`}
        >
          {day}
        </div>
      ))}
    </div>
  );
};
