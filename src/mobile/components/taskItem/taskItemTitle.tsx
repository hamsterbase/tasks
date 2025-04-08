import React from 'react';
import classNames from 'classnames';
import { styles } from '@/mobile/theme';

interface TaskItemTitleProps {
  testId?: string;
  title: string;
  isCanceled: boolean;
  emptyText: string;
}

export const TaskItemTitle: React.FC<TaskItemTitleProps> = ({ title, emptyText, isCanceled, testId }) => {
  return (
    <h3
      data-testid={testId}
      className={classNames(`text-lg overflow-hidden text-ellipsis whitespace-nowrap leading-none`, {
        'line-through': isCanceled,
        [styles.taskItemPlaceholderColor]: !title,
      })}
    >
      {title || emptyText}
    </h3>
  );
};
