import classNames from 'classnames';
import React from 'react';
import { styles } from '../theme';

type Variant = 'Today' | 'Inbox' | 'Scheduled' | 'Completed';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  variant: Variant;
  count?: number;
  overdueCount?: number;
  onClick?: () => void;
}

const iconContainerClasses: Record<Variant, string> = {
  Today: 'ui-icon-container-today',
  Inbox: 'ui-icon-container-inbox',
  Scheduled: 'ui-icon-container-scheduled',
  Completed: 'ui-icon-container-completed',
};

export const StatCard: React.FC<StatCardProps> = ({ icon, label, variant, count, overdueCount, onClick }) => {
  const showCount = count !== undefined || overdueCount !== undefined;

  return (
    <button onClick={onClick} className={classNames(styles.statCardRoot, 'w-full text-left')}>
      <div className={styles.statCardHeader}>
        <span className={classNames(styles.statCardIconContainer, iconContainerClasses[variant])}>{icon}</span>
        {showCount && (
          <div className={styles.statCardCountContainer}>
            {overdueCount !== undefined && overdueCount > 0 && (
              <span className={styles.statCardOverdueCount}>{overdueCount}</span>
            )}
            {count !== undefined && <span className={styles.statCardCount}>{count}</span>}
          </div>
        )}
      </div>
      <span className={styles.statCardLabel}>{label}</span>
    </button>
  );
};
