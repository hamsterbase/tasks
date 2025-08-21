import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import React from 'react';
import { SettingButton } from './Settings/Button/Button';

interface DatabaseItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isCurrent?: boolean;
  actionButtons?: React.ReactNode;
  properties?: Array<{
    label: string;
    value: string;
  }>;
  onClick?: () => void;
}

export const DatabaseItem: React.FC<DatabaseItemProps> = ({
  icon,
  title,
  description,
  isCurrent = false,
  actionButtons,
  properties,
  onClick,
}) => {
  const shProperties = isCurrent && properties && properties.length > 0;

  return (
    <div className={desktopStyles.DatabaseItemContainer}>
      <div className={desktopStyles.DatabaseItemMainRow}>
        <div className={desktopStyles.DatabaseItemContentWrapper}>
          <div className={desktopStyles.DatabaseItemIconWrapper}>
            <div className={desktopStyles.DatabaseItemIcon}>{icon}</div>
          </div>

          <div className={desktopStyles.DatabaseItemContent}>
            <div className={desktopStyles.DatabaseItemTitleRow}>
              <span className={desktopStyles.DatabaseItemTitle}>{title}</span>
              {isCurrent && (
                <span className={desktopStyles.DatabaseItemCurrentBadge}>
                  {localize('database.current', 'Current Database')}
                </span>
              )}
            </div>
            <div className={desktopStyles.DatabaseItemDescriptionRow}>
              <span className={desktopStyles.DatabaseItemDescription}>{description}</span>
            </div>
          </div>
        </div>

        {isCurrent && actionButtons && <div className={desktopStyles.DatabaseItemActionButtons}>{actionButtons}</div>}
        {!isCurrent && (
          <SettingButton variant="text" size="small" inline onClick={onClick} color="primary">
            {localize('database.switch', 'Switch to Database')}
          </SettingButton>
        )}
      </div>

      {shProperties && (
        <div className={desktopStyles.DatabaseItemPropertiesSection}>
          {properties.map((prop, index) => (
            <div key={index} className={desktopStyles.DatabaseItemProperty}>
              <div className={desktopStyles.DatabaseItemPropertyLabel}>{prop.label}</div>
              <div className={desktopStyles.DatabaseItemPropertyValue}>{prop.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
