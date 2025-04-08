import classNames from 'classnames';
import React from 'react';
import { styles } from '../theme';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value?: number;
  badge?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, badge }) => {
  return (
    <div className={classNames('flex items-center justify-between', styles.homeMenuItemPadding)}>
      <div className={classNames('flex items-center', styles.homePageItemGap)}>
        <div>{icon}</div>
        <div className="flex flex-col justify-center">
          <span className="text-lg text-t1 font-medium">{title}</span>
        </div>
      </div>
      <div className={classNames('flex items-center', styles.homePageItemGap)}>
        {typeof badge === 'number' && badge > 0 && (
          <span className={classNames('inline-flex items-center justify-center', styles.homeMenuDueTaskNumberColor)}>
            {badge}
          </span>
        )}
        {typeof value === 'number' && value > 0 && <span className={styles.homeMenuNumberColor}>{value}</span>}
      </div>
    </div>
  );
};
