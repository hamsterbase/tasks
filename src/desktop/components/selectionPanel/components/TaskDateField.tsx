import { formatDate } from '@/core/time/formatDate';
import { formatRemainingDays } from '@/core/time/formatRemainingDays';
import { isPastOrToday } from '@/core/time/isPast';
import { desktopStyles } from '@/desktop/theme/main';
import classNames from 'classnames';
import React from 'react';
import { TaskDetailAttributeRow } from './TaskDetailAttributeRow';

interface TaskDateFieldProps {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  date?: number;
  onDateClick: (e: React.MouseEvent<HTMLElement>) => void;
  isDue?: boolean;
  testId?: string;
}

export const TaskDateField: React.FC<TaskDateFieldProps> = ({
  label,
  icon,
  date,
  onDateClick,
  isDue = false,
  placeholder,
  testId,
}) => {
  if (!date) {
    return (
      <TaskDetailAttributeRow
        icon={icon}
        label={label}
        content={placeholder}
        dataTestId={testId}
        placeholder={true}
        onClick={onDateClick}
      />
    );
  }

  return (
    <TaskDetailAttributeRow
      icon={icon}
      label={label}
      dataTestId={testId}
      onClick={onDateClick}
      danger={isDue && isPastOrToday(date)}
      content={
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
      }
    />
  );
};
