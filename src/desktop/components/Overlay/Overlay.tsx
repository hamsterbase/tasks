import { CloseIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { TestIds } from '@/testIds';
import React from 'react';
import { Space } from '../Space/Space';
import { SettingButton } from '../Settings/Button/Button';

interface OverlayProps {
  title: string;
  onClose: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  hideFooter?: boolean;
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
  hideFooter = false,
}) => {
  const showFooter = (onCancel || onConfirm) && !hideFooter;
  return (
    <div
      className={desktopStyles.OverlayBackdrop}
      style={{
        zIndex,
      }}
    >
      <div className={desktopStyles.OverlayBackgroundMask} />
      <div className={desktopStyles.OverlayContainer} data-test-id={TestIds.DesktopDialog.Container}>
        <div className={desktopStyles.OverlayHeader}>
          <h3 className={desktopStyles.OverlayTitle} data-test-id={TestIds.DesktopDialog.Title}>
            {title}
          </h3>
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
