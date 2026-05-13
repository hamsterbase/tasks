import { SwitchDatabaseIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import React from 'react';

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
  extraSection?: React.ReactNode;
  onClick?: () => void;
}

export const DatabaseItem: React.FC<DatabaseItemProps> = ({
  icon,
  title,
  description,
  isCurrent = false,
  actionButtons,
  properties,
  extraSection,
  onClick,
}) => {
  const showProperties = isCurrent && properties && properties.length > 0;
  const showExtraSection = isCurrent && extraSection;

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
          <button
            type="button"
            className={desktopStyles.DatabaseItemActionButton}
            title={localize('database.switch', 'Switch to Database')}
            aria-label={localize('database.switch', 'Switch to Database')}
            onClick={onClick}
          >
            <SwitchDatabaseIcon className={desktopStyles.DatabaseItemActionButtonIcon} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {showProperties && (
        <div className={desktopStyles.DatabaseItemPropertiesSection}>
          {properties.map((prop, index) => (
            <div key={index} className={desktopStyles.DatabaseItemProperty}>
              <div className={desktopStyles.DatabaseItemPropertyLabel}>{prop.label}</div>
              <div className={desktopStyles.DatabaseItemPropertyValue}>{prop.value}</div>
            </div>
          ))}
        </div>
      )}

      {showExtraSection && <div className={desktopStyles.DatabaseItemExtraSection}>{extraSection}</div>}
    </div>
  );
};
