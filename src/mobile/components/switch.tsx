import classNames from 'classnames';
import React from 'react';
import { styles } from '../theme';

export interface SwitchProps {
  checked: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked }) => {
  return (
    <div
      className={classNames('w-10 h-6 rounded-full relative transition-colors', {
        [styles.switchCheckedBackground]: checked,
        [styles.switchUncheckedBackground]: !checked,
        [styles.switchOuterBorder]: !checked,
      })}
    >
      <div
        className={classNames(
          'absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200',
          checked ? 'left-5' : 'left-1',
          styles.switchInnerBorder
        )}
      ></div>
    </div>
  );
};
