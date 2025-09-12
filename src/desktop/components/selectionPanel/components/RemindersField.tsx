import { AlarmIcon } from '@/components/icons';
import { ReminderWithId } from '@/core/type';
import { useTimepicker } from '@/desktop/overlay/timePicker/useTimepicker';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import dayjs from 'dayjs';
import { TreeID } from 'loro-crdt';
import React from 'react';

interface RemindersFieldProps {
  itemId: TreeID;
  label: string;
  reminders: ReminderWithId[];
}

export const RemindersField: React.FC<RemindersFieldProps> = ({ reminders, itemId }) => {
  const showTimePicker = useTimepicker();
  const todoService = useService(ITodoService);

  const handleAddReminderClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left,
      y: rect.top,
    };
    showTimePicker(
      undefined,
      (date) => {
        if (date) {
          todoService.addReminder({
            itemId: itemId,
            time: date,
          });
        }
      },
      position
    );
  };

  const handleReminderClick = (reminder: ReminderWithId, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left,
      y: rect.top,
    };
    showTimePicker(
      reminder.time,
      (date) => {
        if (!date) {
          todoService.deleteReminder(reminder.reminderId);
        } else {
          todoService.updateReminder(reminder.reminderId, {
            time: date,
          });
        }
      },
      position
    );
  };
  if (!reminders || reminders.length === 0) {
    return (
      <button onClick={handleAddReminderClick} className={desktopStyles.SelectionFieldButton}>
        <div className={desktopStyles.SelectionFieldIcon}>{<AlarmIcon></AlarmIcon>}</div>
        <span className={desktopStyles.SelectionFieldPlaceholderText}>
          {localize('tasks.reminders_placeholder', 'Add reminders')}
        </span>
      </button>
    );
  }

  return (
    <div>
      <button onClick={handleAddReminderClick} className={desktopStyles.SelectionFieldButton}>
        <div className={desktopStyles.SelectionFieldIcon}>{<AlarmIcon></AlarmIcon>}</div>
        <span className={desktopStyles.SelectionFieldPlaceholderText}>
          {localize('tasks.reminders_placeholder', 'Add reminders')}
        </span>
      </button>
      <div className={'ml-7'}>
        {reminders.map((reminder) => (
          <div
            key={reminder.reminderId}
            className={desktopStyles.SelectionFieldButton}
            onClick={(e) => handleReminderClick(reminder, e)}
          >
            <span className="text-t1 text-base leading-5">{dayjs(reminder.time).format('MMM D, YYYY')}</span>
            <span className="text-t2 text-sm leading-5">{dayjs(reminder.time).format('HH:mm')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
