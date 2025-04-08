import { styles } from '@/mobile/theme';
import classNames from 'classnames';
import React from 'react';

export interface TabbarProps {
  options: {
    label: string;
    value: string;
    testid?: string;
  }[];
  value: string;
  onChange: (value: string) => void;
}

const tabbarClassNames = {
  container: classNames(
    'flex justify-center items-center',
    styles.tabbarBackground,
    styles.tabbarHeight,
    styles.tabbarRound
  ),
  item: (isActive: boolean) =>
    classNames('text-center flex flex-col items-center', styles.tabbarItemWidth, styles.tabbarItemTextSize, {
      [styles.tabbarItemTextColorActive]: isActive,
      [styles.tabbarItemFontWeight]: isActive,
      [styles.tabbarItemTextColorInactive]: !isActive,
    }),
  indicator: (isActive: boolean) =>
    classNames(
      styles.tabbarIndicatorWidth,
      styles.tabbarIndicatorHeight,
      styles.tabbarIndicatorMarginTop,
      styles.tabbarIndicatorRound,
      {
        [styles.tabbarIndicatorColorActive]: isActive,
        [styles.tabbarIndicatorColorInactive]: !isActive,
      }
    ),
};

export const Tabbar: React.FC<TabbarProps> = ({ options, value, onChange }) => {
  return (
    <div className={tabbarClassNames.container}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <div
            data-testid={option.testid}
            key={option.value}
            className={tabbarClassNames.item(isActive)}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            <div className={tabbarClassNames.indicator(isActive)} />
          </div>
        );
      })}
    </div>
  );
};
