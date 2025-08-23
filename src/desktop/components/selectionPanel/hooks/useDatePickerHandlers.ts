import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { TaskInfo } from '@/core/state/type.ts';
import { useDatepicker } from '@/desktop/overlay/datePicker/useDatepicker';
import React from 'react';

interface UseDatePickerHandlersProps {
  task: TaskInfo;
}

export const useDatePickerHandlers = ({ task }: UseDatePickerHandlersProps) => {
  const showDatePicker = useDatepicker();
  const taskItemActions = useTaskItemActions(task);

  const showDatePickerAtPosition = (
    currentDate: number | undefined,
    onDateSelect: (date: number | null) => void,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left - 280 - 10, // 280px is the width of datepicker, 10px gap
      y: rect.top,
    };
    showDatePicker(currentDate, onDateSelect, position);
  };

  const handleStartDateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    showDatePickerAtPosition(
      task.startDate,
      (date) => {
        if (date !== undefined) {
          taskItemActions.updateStartDate(date);
        }
      },
      e
    );
  };

  const handleDueDateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    showDatePickerAtPosition(
      task.dueDate,
      (date) => {
        if (date !== undefined) {
          taskItemActions.updateDueDate(date);
        }
      },
      e
    );
  };

  const handleClearStartDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    taskItemActions.clearStartDate();
  };

  const handleClearDueDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    taskItemActions.clearDueDate();
  };

  return {
    handleStartDateClick,
    handleDueDateClick,
    handleClearStartDate,
    handleClearDueDate,
  };
};
