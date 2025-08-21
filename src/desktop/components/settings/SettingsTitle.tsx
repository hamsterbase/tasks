import classNames from 'classnames';
import React from 'react';
import { desktopStyles } from '@/desktop/theme/main';

interface SettingsTitleProps {
  title: string;
  description?: string;
  level?: 1 | 2;
  action?: React.ReactNode;
}

export const SettingsTitle: React.FC<SettingsTitleProps> = ({ title, description, level = 1, action }) => {
  return (
    <div className={desktopStyles.SettingsTitleContainer}>
      <div className={desktopStyles.SettingsTitleContent}>
        <h2
          className={classNames(desktopStyles.SettingsTitleHeading, {
            [desktopStyles.SettingsTitleHeadingLevel1]: level === 1,
            [desktopStyles.SettingsTitleHeadingLevel2]: level === 2,
          })}
        >
          {title}
        </h2>
        {description && <p className={desktopStyles.SettingsTitleDescription}>{description}</p>}
      </div>
      {action && <div className={desktopStyles.SettingsTitleActionContainer}>{action}</div>}
    </div>
  );
};
