import classNames from 'classnames';
import React, { useContext } from 'react';
import { styles } from '../../theme';
import { AttrContainer, AttrStyleContext } from './AttrContainer';

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
}

export const AttrLabel: React.FC<AttrLabelProps> = ({ icon, placeholder, value, onClick, onClear, testId }) => {
  const attrStyles = useContext(AttrStyleContext);

  return (
    <AttrContainer icon={icon} onClick={onClick} onClear={value ? onClear : undefined} testId={testId}>
      {value ? (
        <p className="flex items-baseline gap-2">
          <span
            className={classNames(
              'text-sm leading-6',
              value.titleType === 'danger' ? 'text-accent-danger' : attrStyles.labelTitleColor
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
