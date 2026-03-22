import { formatCompletionAt } from '@/core/time/formatCompletionAt';
import { CircleCheckIcon, CircleXIcon } from '@/components/icons';
import { ItemStatus } from '@/core/type';
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
    <div className="flex items-center gap-1 text-xs font-semibold leading-6 text-t3">
      {isCompleted ? (
        <CircleCheckIcon className="size-3" strokeWidth={1.5} />
      ) : (
        <CircleXIcon className="size-3" strokeWidth={1.5} />
      )}
      {formatCompletionAt(completionAt)}
    </div>
  );
};
