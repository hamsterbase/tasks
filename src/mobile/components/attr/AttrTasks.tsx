import React from 'react';
import { styles } from '../../theme';
import { AttrContainer } from './AttrContainer';

interface AttrTasksProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  addButtonLabel: string;
  onAdd: () => void;
  testId?: string;
  addButtonTestId?: string;
}

export const AttrTasks: React.FC<AttrTasksProps> = ({
  icon,
  children,
  addButtonLabel,
  onAdd,
  testId,
  addButtonTestId,
}) => {
  return (
    <AttrContainer icon={icon} testId={testId}>
      <div className={styles.createTaskSubtaskList}>
        {children}
        <span className={styles.createTaskAddButton} onClick={onAdd} data-testid={addButtonTestId}>
          {addButtonLabel}
        </span>
      </div>
    </AttrContainer>
  );
};
