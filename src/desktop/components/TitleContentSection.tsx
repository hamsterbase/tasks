import React, { ReactNode } from 'react';
import { desktopStyles } from '@/desktop/theme/main';

interface TitleContentSectionProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export const TitleContentSection: React.FC<TitleContentSectionProps> = ({ title, children, action }) => {
  return (
    <div className={desktopStyles.TitleContentSectionContainer}>
      <div className={desktopStyles.TitleContentSectionHeader}>
        <h2 className={desktopStyles.TitleContentSectionTitle}>{title}</h2>
        {action && <div className={desktopStyles.TitleContentSectionAction}>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};
