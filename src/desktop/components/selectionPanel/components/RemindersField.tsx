import { BellIcon, CloseIcon, PlusIcon } from '@/components/icons';
import { formatReminderTime } from '@/core/time/formatReminderTime';
import { isTimestampInPast } from '@/core/time/isPast';
import { ReminderWithId } from '@/core/type';
import { useTimepicker } from '@/desktop/overlay/timePicker/useTimepicker';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import classNames from 'classnames';
import { TreeID } from 'loro-crdt';
import React from 'react';
import { TaskDetailAttributeRow } from './TaskDetailAttributeRow';

interface RemindersFieldProps {
  itemId: TreeID;
  reminders: ReminderWithId[];
}

const sortReminders = (reminders: ReminderWithId[]) => [...reminders].sort((a, b) => a.time - b.time);

const formatReminderChip = (reminder: ReminderWithId) => {
  const { date, time } = formatReminderTime(reminder.time);
  return date ? `${date} ${time}` : time;
};

export const RemindersField: React.FC<RemindersFieldProps> = ({ reminders, itemId }) => {
  const showTimePicker = useTimepicker();
  const todoService = useService(ITodoService);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  const openTimePicker = (initialDate: number | undefined, anchor: HTMLElement, reminderId?: string) => {
    const rect = anchor.getBoundingClientRect();
    const position = {
      x: rect.left,
      y: rect.top,
    };
    showTimePicker(
      initialDate,
      (date) => {
        if (date) {
          if (reminderId) {
            todoService.updateReminder(reminderId, {
              time: date,
            });
          } else {
            todoService.addReminder({
              itemId,
              time: date,
            });
          }
        } else if (reminderId) {
          todoService.deleteReminder(reminderId);
        }
      },
      position
    );
  };

  const handleAddReminderClick = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    setIsOpen(false);
    openTimePicker(undefined, e.currentTarget as HTMLElement);
  };

  return (
    <div className={desktopStyles.RemindersFieldAnchor} ref={anchorRef}>
      <TaskDetailAttributeRow
        icon={<BellIcon className={desktopStyles.TaskDetailAttributeIcon} />}
        label={localize('desktop.task_detail.reminders', 'Reminders')}
        placeholder={reminders.length === 0}
        onClick={() => setIsOpen((value) => !value)}
        content={
          reminders.length === 0 ? (
            localize('desktop.task_detail.unset', 'Not set')
          ) : (
            <div className={desktopStyles.TaskDetailAttributeTagList}>
              {sortReminders(reminders).map((reminder) => {
                const isReminderPast = isTimestampInPast(reminder.time);
                return (
                  <span
                    key={reminder.reminderId}
                    className={classNames(desktopStyles.TaskDetailAttributeTag, {
                      [desktopStyles.RemindersFieldPastTag]: isReminderPast,
                    })}
                  >
                    {formatReminderChip(reminder)}
                  </span>
                );
              })}
            </div>
          )
        }
      />
      {isOpen && (
        <div className={desktopStyles.RemindersFieldPopover} ref={popoverRef}>
          {reminders.length === 0 && (
            <div className={desktopStyles.RemindersFieldPopoverEmpty}>
              {localize('desktop.task_detail.reminders_empty', 'No reminders')}
            </div>
          )}
          {sortReminders(reminders).map((reminder) => {
            const { date, time } = formatReminderTime(reminder.time);
            const isReminderPast = isTimestampInPast(reminder.time);

            return (
              <div
                key={reminder.reminderId}
                className={desktopStyles.RemindersFieldPopoverItem}
                onClick={(e) => {
                  setIsOpen(false);
                  openTimePicker(reminder.time, e.currentTarget, reminder.reminderId);
                }}
              >
                <span
                  className={classNames(desktopStyles.RemindersFieldDateText, {
                    [desktopStyles.RemindersFieldPastText]: isReminderPast,
                  })}
                >
                  {date}
                </span>
                <span
                  className={classNames(desktopStyles.RemindersFieldTimeText, {
                    [desktopStyles.RemindersFieldPastText]: isReminderPast,
                  })}
                >
                  {time}
                </span>
                <button
                  className={desktopStyles.RemindersFieldPopoverDeleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    todoService.deleteReminder(reminder.reminderId);
                  }}
                >
                  <CloseIcon className={desktopStyles.RemindersFieldPopoverDeleteIcon} />
                </button>
              </div>
            );
          })}
          <div className={desktopStyles.RemindersFieldPopoverDivider} />
          <div className={desktopStyles.RemindersFieldPopoverAddRow} onClick={handleAddReminderClick}>
            <PlusIcon className={desktopStyles.RemindersFieldPopoverAddIcon} />
            <span>{localize('desktop.task_detail.add_reminder', 'Add reminder')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
