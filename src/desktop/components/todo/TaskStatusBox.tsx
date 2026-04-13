import classNames from 'classnames';
import React from 'react';
import { TaskIcon } from './TaskIcon';

export const TaskStatusBox: React.FC<{ status: string; size?: 'lg' | 'md' | 'sm' | 'xs'; className?: string }> = ({
  status,
  size = 'md',
  className,
}) => {
  return <TaskIcon status={status} size={size} className={classNames('transition-colors', className)} />;
};
