import { formatCompletionAt } from '@/core/time/formatCompletionAt';
import { ItemStatus } from '@/core/type';
import classNames from 'classnames';
import React from 'react';

interface TaskItemCompletionAtProps {
  completionAt?: number;
  status: ItemStatus;
}

export const TaskItemCompletionAt: React.FC<TaskItemCompletionAtProps> = ({ completionAt, status }) => {
  if (!completionAt || status === 'created') {
    return null;
  }
  const isCompleted = status === 'completed';
  return (
    <div
      className={classNames('text-xs', {
        'text-brand': isCompleted,
        'text-t3': !isCompleted,
      })}
    >
      {formatCompletionAt(completionAt)}
    </div>
  );
};