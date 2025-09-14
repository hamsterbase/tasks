import { formatReminderTime } from '@/core/time/formatReminderTime';
import React from 'react';

interface ReminderTimeInfoItemProps {
  reminderTime?: number;
}

export const ReminderTimeInfoItem: React.FC<ReminderTimeInfoItemProps> = ({ reminderTime }) => {
  const { date, time } = formatReminderTime(reminderTime);

  return (
    <div className="flex items-center gap-2">
      {date && <span className="text-t1">{date}</span>}
      <span className="text-sm text-t2">{time}</span>
    </div>
  );
};
