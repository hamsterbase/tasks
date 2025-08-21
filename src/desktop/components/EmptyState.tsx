import { desktopStyles } from '@/desktop/theme/main';
import React from 'react';

interface EmptyStateProps {
  label: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ label }) => {
  return (
    <div className={desktopStyles.EmptyStateContainer}>
      <p className={desktopStyles.EmptyStateText}>{label}</p>
    </div>
  );
};
