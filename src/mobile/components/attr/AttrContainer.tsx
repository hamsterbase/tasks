import { CloseIcon } from '@/components/icons';
import React, { useContext } from 'react';
import { styles } from '../../theme';

export interface AttrStyles {
  row: string;
  iconContainer: string;
  content: string;
  labelTitleColor?: string;
}

const defaultAttrStyles: AttrStyles = {
  row: styles.editTaskAttrRow,
  iconContainer: styles.editTaskAttrIconContainer,
  content: styles.editTaskAttrContent,
};

export const AttrStyleContext = React.createContext<AttrStyles>(defaultAttrStyles);

interface AttrContainerProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  onClear?: () => void;
  testId?: string;
}

export const AttrContainer: React.FC<AttrContainerProps> = ({ icon, children, onClick, onClear, testId }) => {
  const attrStyles = useContext(AttrStyleContext);
  return (
    <div className={attrStyles.row} onClick={onClick} data-testid={testId}>
      <div className={attrStyles.iconContainer}>{icon}</div>
      <div className={attrStyles.content}>
        {onClear ? (
          <div className="flex w-full items-center justify-between">
            {children}
            <button
              className={styles.createTaskReminderRemoveBtn}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <CloseIcon className={styles.createTaskRemoveIcon} strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
