import { formatDate } from '@/core/time/formatDate';
import { formatRemainingDays } from '@/core/time/formatRemainingDays';
import { isPastOrToday } from '@/core/time/isPast';
import { desktopStyles } from '@/desktop/theme/main';
import classNames from 'classnames';
import React from 'react';

interface TaskDateFieldProps {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  date?: number;
  onDateClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isDue?: boolean;
}

export const TaskDateField: React.FC<TaskDateFieldProps> = ({
  icon,
  date,
  onDateClick,
  isDue = false,
  placeholder,
}) => {
  if (!date) {
    return (
      <button className={desktopStyles.SelectionFieldButton} onClick={onDateClick}>
        <div className={desktopStyles.SelectionFieldIcon}>{icon}</div>
        <span className={desktopStyles.SelectionFieldPlaceholderText}> {placeholder}</span>
      </button>
    );
  }

  return (
    <button className={desktopStyles.SelectionFieldButton} onClick={onDateClick}>
      <div className={desktopStyles.SelectionFieldIcon}>{icon}</div>
      <div className={desktopStyles.TaskDateFieldDateContainer}>
        <span
          className={classNames({
            [desktopStyles.TaskDateFieldDateOverdue]: isDue && isPastOrToday(date),
            [desktopStyles.TaskDateFieldDateNormal]: !isDue || !isPastOrToday(date),
          })}
        >
          {formatDate(date)}
        </span>
        <span className={desktopStyles.TaskDateFieldRemainingText}>{formatRemainingDays(date)}</span>
      </div>
    </button>
  );
};
