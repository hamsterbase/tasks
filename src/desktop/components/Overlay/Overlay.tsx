import { CloseIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import React from 'react';
import { SettingButton } from '../Settings/Button/Button';
import { Space } from '../Space/Space';

interface OverlayProps {
  title: string;
  onClose: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  children: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  zIndex?: number;
  cancelDisabled?: boolean;
  confirmDisabled?: boolean;
}

export const Overlay: React.FC<OverlayProps> = ({
  title,
  onClose,
  onCancel,
  onConfirm,
  children,
  cancelText,
  confirmText,
  zIndex = 1000,
  cancelDisabled = false,
  confirmDisabled = false,
}) => {
  const showFooter = onCancel || onConfirm;
  return (
    <div
      className={desktopStyles.OverlayBackdrop}
      style={{
        zIndex,
      }}
    >
      <div className={desktopStyles.OverlayBackgroundMask} />
      <div className={desktopStyles.OverlayContainer}>
        <div className={desktopStyles.OverlayHeader}>
          <h3 className={desktopStyles.OverlayTitle}>{title}</h3>
          <button onClick={onClose} className={desktopStyles.OverlayCloseButton}>
            <CloseIcon />
          </button>
        </div>

        <div className={desktopStyles.OverlayContent}>{children}</div>
        {showFooter && <Space size="medium"></Space>}
        {showFooter && (
          <div className={desktopStyles.OverlayFooter}>
            {onCancel && (
              <SettingButton variant="default" size="medium" onClick={onCancel} disabled={cancelDisabled}>
                {cancelText || 'Cancel'}
              </SettingButton>
            )}

            {onConfirm && (
              <SettingButton
                variant="solid"
                color="primary"
                size="medium"
                onClick={onConfirm}
                disabled={confirmDisabled}
              >
                {confirmText || 'Confirm'}
              </SettingButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
