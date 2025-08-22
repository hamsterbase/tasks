import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import React from 'react';

export const WeekdayHeader: React.FC = () => {
  const weekdays = [
    localize('date_picker.monday', 'Mon'),
    localize('date_picker.tuesday', 'Tue'),
    localize('date_picker.wednesday', 'Wed'),
    localize('date_picker.thursday', 'Thu'),
    localize('date_picker.friday', 'Fri'),
    localize('date_picker.saturday', 'Sat'),
    localize('date_picker.sunday', 'Sun'),
  ];

  return (
    <div className={desktopStyles.DatePickerOverlayWeekdayGrid}>
      {weekdays.map((day) => (
        <div key={day} className={desktopStyles.DatePickerOverlayWeekdayCell}>
          {day}
        </div>
      ))}
    </div>
  );
};
