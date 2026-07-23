import React from 'react';
import { PlusIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';

interface SettingsEmptyStateActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const SettingsEmptyStateAction: React.FC<SettingsEmptyStateActionProps> = ({ children, ...props }) => {
  return (
    <button type="button" className={desktopStyles.SettingsEmptyStateActionButton} {...props}>
      <PlusIcon className={desktopStyles.SettingsEmptyStateActionIcon} strokeWidth={1.75} />
      {children}
    </button>
  );
};
