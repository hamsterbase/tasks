import { getCalendarWeekdayLabels, type CalendarWeekStartDay } from '@/core/time/calendarWeekStart';
import { desktopStyles } from '@/desktop/theme/main';
import React from 'react';

interface WeekdayHeaderProps {
  weekStartDay: CalendarWeekStartDay;
}

export const WeekdayHeader: React.FC<WeekdayHeaderProps> = ({ weekStartDay }) => {
  const weekdays = getCalendarWeekdayLabels(weekStartDay);

  return (
    <div className={desktopStyles.DatePickerCalendarWeekdayGrid}>
      {weekdays.map((day) => (
        <div key={day} className={desktopStyles.DatePickerCalendarWeekdayCell}>
          {day}
        </div>
      ))}
    </div>
  );
};
