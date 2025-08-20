import { TaskStatusBox } from '@/desktop/components/todo/TaskStatusBox';
import classNames from 'classnames';
import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, children, className }) => {
  return (
    <div className={classNames('flex items-center gap-2', className)}>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div
          className={classNames('size-5 cursor-pointer', {
            'text-brand': checked,
            'text-t3': !checked,
          })}
          onClick={() => onChange(!checked)}
        >
          <TaskStatusBox status={checked ? 'completed' : 'pending'} className="size-full" />
        </div>
      </div>
      <div className="text-base text-t3 leading-5">{children}</div>
    </div>
  );
};
