import { TaskStatusBox } from '@/desktop/components/todo/TaskStatusBox';
import classNames from 'classnames';
import React from 'react';
import { desktopStyles } from '@/desktop/theme/main';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, children, className }) => {
  return (
    <div className={classNames(desktopStyles.CheckboxContainer, className)}>
      <div className={desktopStyles.CheckboxInputContainer}>
        <input
          type="checkbox"
          className={desktopStyles.CheckboxInput}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={classNames(desktopStyles.CheckboxBox, {
            [desktopStyles.CheckboxBoxChecked]: checked,
            [desktopStyles.CheckboxBoxUnchecked]: !checked,
          })}
          onClick={() => onChange(!checked)}
        >
          <TaskStatusBox status={checked ? 'completed' : 'pending'} className={desktopStyles.CheckboxStatusBox} />
        </div>
      </div>
      <div className={desktopStyles.CheckboxLabel}>{children}</div>
    </div>
  );
};
