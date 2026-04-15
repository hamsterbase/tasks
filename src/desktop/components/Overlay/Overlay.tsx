import { CloseIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
import React from 'react';

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
  dataTestId?: string;
  contentClassName?: string;
  containerClassName?: string;
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
  dataTestId,
  contentClassName,
  containerClassName,
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
      <div
        className={classNames(desktopStyles.OverlayContainer, containerClassName)}
        data-test-id={dataTestId || TestIds.DesktopDialog.Container}
      >
        <div className={desktopStyles.OverlayHeader}>
          <h3 className={desktopStyles.OverlayTitle} data-test-id={TestIds.DesktopDialog.Title}>
            {title}
          </h3>
          <button onClick={onClose} className={desktopStyles.OverlayCloseButton}>
            <CloseIcon className={desktopStyles.OverlayCloseIcon} />
          </button>
        </div>

        <div className={classNames(desktopStyles.OverlayContent, contentClassName)}>{children}</div>
        {showFooter && (
          <div className={desktopStyles.OverlayFooter}>
            {onCancel && (
              <button
                className={desktopStyles.OverlayCancelButton}
                onClick={onCancel}
                disabled={cancelDisabled}
                type="button"
              >
                {cancelText || 'Cancel'}
              </button>
            )}

            {onConfirm && (
              <button
                className={classNames(
                  desktopStyles.OverlayConfirmButton,
                  confirmDisabled ? desktopStyles.OverlayConfirmButtonDisabled : ''
                )}
                onClick={onConfirm}
                disabled={confirmDisabled}
                type="button"
              >
                {confirmText || 'Confirm'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
