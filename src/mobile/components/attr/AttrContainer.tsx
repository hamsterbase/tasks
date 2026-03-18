import { CloseIcon } from '@/components/icons';
import React from 'react';
import { styles } from '../../theme';

interface AttrContainerProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  onClear?: () => void;
  testId?: string;
}

export const AttrContainer: React.FC<AttrContainerProps> = ({ icon, children, onClick, onClear, testId }) => {
  return (
    <div className={styles.createTaskAttrRow} onClick={onClick} data-testid={testId}>
      <div className={styles.createTaskAttrIconContainer}>{icon}</div>
      <div className={styles.createTaskAttrContent}>
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
              <CloseIcon className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
