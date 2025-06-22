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
    <div className="grid grid-cols-7 gap-1 py-1 px-2 sticky top-0 bg-white">
      {weekdays.map((day) => (
        <div key={day} className="text-center text-xs text-t3 h-6 flex items-center justify-center">
          {day}
        </div>
      ))}
    </div>
  );
};
