import { styles } from '@/mobile/theme';
import { formatReminderTime } from '@/core/time/formatReminderTime';
import React from 'react';

interface ReminderTimeInfoItemProps {
  reminderTime?: number;
}

export const ReminderTimeInfoItem: React.FC<ReminderTimeInfoItemProps> = ({ reminderTime }) => {
  const { date, time } = formatReminderTime(reminderTime);

  return (
    <div className={styles.infoItemInlineRow}>
      {date && <span className={styles.infoItemTextColor}>{date}</span>}
      <span className={styles.formHintText}>{time}</span>
    </div>
  );
};
