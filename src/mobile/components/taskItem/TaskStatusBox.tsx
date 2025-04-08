import React from 'react';
import { ItemStatus } from '@/core/type.ts';
import { CancelIcon, CheckIcon } from '@/components/icons';
import classNames from 'classnames';

interface TaskStatusBoxProps {
  status: ItemStatus;
  className?: string;
}

export const TaskStatusBox: React.FC<TaskStatusBoxProps> = ({ status, className }) => {
  return (
    <div className={classNames('flex items-center justify-center size-full', className)}>
      <div
        className={classNames(
          'rounded-sm border-2 border-solid transition-colors flex items-center justify-center box-border size-[90%]'
        )}
      >
        {status === 'completed' && <CheckIcon className="size-full" />}
        {status === 'canceled' && <CancelIcon className="size-full" />}
      </div>
    </div>
  );
};
