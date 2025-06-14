import { CancelIcon, CheckIcon } from '@/components/icons';
import classNames from 'classnames';
import React from 'react';

export const TaskStatusBox: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
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
