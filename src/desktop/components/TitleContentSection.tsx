import React, { ReactNode } from 'react';
import { desktopStyles } from '@/desktop/theme/main';

interface TitleContentSectionProps {
  title: string;
  children: ReactNode;
}

export const TitleContentSection: React.FC<TitleContentSectionProps> = ({ title, children }) => {
  return (
    <div className={desktopStyles.TitleContentSectionContainer}>
      <div className={desktopStyles.TitleContentSectionHeader}>
        <h2 className={desktopStyles.TitleContentSectionTitle}>{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
};
