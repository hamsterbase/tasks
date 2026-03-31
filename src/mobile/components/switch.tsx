import classNames from 'classnames';
import React from 'react';
import { styles } from '../theme';

export interface SwitchProps {
  checked: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked }) => {
  return (
    <div
      className={classNames('w-11 h-6.5 rounded-full relative shrink-0 transition-colors duration-200', {
        [styles.switchCheckedBackground]: checked,
        [styles.switchUncheckedBackground]: !checked,
        [styles.switchOuterBorder]: !checked,
      })}
    >
      <div
        className={classNames(
          'absolute top-0.5 left-0.5 size-5.5 rounded-full bg-white transition-transform duration-200',
          checked ? 'translate-x-4.5' : '',
          styles.switchInnerBorder
        )}
      ></div>
    </div>
  );
};
