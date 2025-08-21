import React from 'react';
import { CopyIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';

interface InfoItemProps {
  label: string;
  value: string;
  showCopyButton?: boolean;
  onCopy?: (value: string) => void;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, value, showCopyButton = false, onCopy }) => {
  const handleCopyValue = () => {
    if (onCopy) {
      onCopy(value);
    }
  };

  return (
    <div className={desktopStyles.InfoItemContainer}>
      <span className={desktopStyles.InfoItemLabel}>{label}</span>
      <div className={desktopStyles.InfoItemValueContainer}>
        <span className={desktopStyles.InfoItemValue}>{value}</span>
        {showCopyButton && (
          <button onClick={handleCopyValue} className={desktopStyles.InfoItemCopyButton} aria-label="Copy">
            <CopyIcon className={desktopStyles.InfoItemCopyIcon} />
          </button>
        )}
      </div>
    </div>
  );
};
