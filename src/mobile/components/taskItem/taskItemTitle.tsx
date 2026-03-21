import React from 'react';
import classNames from 'classnames';
import { styles } from '@/mobile/theme';

interface TaskItemTitleProps {
  testId?: string;
  title: string;
  isCanceled: boolean;
  isCompleted?: boolean;
  emptyText: string;
}

export const TaskItemTitle: React.FC<TaskItemTitleProps> = ({
  title,
  emptyText,
  isCanceled,
  isCompleted = false,
  testId,
}) => {
  return (
    <span
      data-testid={testId}
      className={classNames(
        'flex-1 text-base leading-6 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0',
        { 'line-through': isCanceled },
        isCanceled || isCompleted ? 'text-t3' : title ? 'text-t1' : styles.taskItemPlaceholderColor
      )}
    >
      {title || emptyText}
    </span>
  );
};
