import classNames from 'classnames';
import React from 'react';
import { styles } from '../../theme';
import { AttrContainer, AttrStyles } from './AttrContainer';

export interface AttrLabelValue {
  title: string;
  subtitle?: string;
  titleType?: 'danger';
}

interface AttrLabelProps {
  icon: React.ReactNode;
  placeholder: string;
  value?: AttrLabelValue;
  onClick?: () => void;
  onClear?: () => void;
  testId?: string;
  attrStyles?: AttrStyles;
  labelTitleColor?: string;
}

export const AttrLabel: React.FC<AttrLabelProps> = ({
  icon,
  placeholder,
  value,
  onClick,
  onClear,
  testId,
  attrStyles,
  labelTitleColor,
}) => {
  return (
    <AttrContainer
      icon={icon}
      onClick={onClick}
      onClear={value ? onClear : undefined}
      testId={testId}
      attrStyles={attrStyles}
    >
      {value ? (
        <p className="flex items-baseline gap-2">
          <span
            className={classNames(
              'text-sm leading-6',
              value.titleType === 'danger' ? 'text-accent-danger' : (labelTitleColor ?? attrStyles?.labelTitleColor)
            )}
          >
            {value.title}
          </span>
          {value.subtitle && <span className="text-sm text-t2">{value.subtitle}</span>}
        </p>
      ) : (
        <span className={styles.createTaskAttrPlaceholder}>{placeholder}</span>
      )}
    </AttrContainer>
  );
};
