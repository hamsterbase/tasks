import React from 'react';
import { desktopStyles } from '@/desktop/theme/main';
import { SettingsTitle } from './SettingsTitle';

interface SettingsSectionProps {
  title: string;
  description?: string;
  level?: 1 | 2;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  level = 1,
  action,
  children,
}) => {
  return (
    <section className={desktopStyles.SettingsSectionContainer}>
      <SettingsTitle title={title} description={description} level={level} action={action} />
      {children}
    </section>
  );
};
