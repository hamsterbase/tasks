import { styles } from '@/mobile/theme';
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
    <div className={styles.taskItemCompletionAt}>
      {isCompleted ? (
        <CircleCheckIcon className={styles.taskItemCompletionAtIcon} strokeWidth={1.5} />
      ) : (
        <CircleXIcon className={styles.taskItemCompletionAtIcon} strokeWidth={1.5} />
      )}
      {formatCompletionAt(completionAt)}
    </div>
  );
};
