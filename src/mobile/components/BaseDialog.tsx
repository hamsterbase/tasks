import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import classNames from 'classnames';
import React from 'react';

export interface BaseDialogProps {
  zIndex: number;
  title: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  hideFooter?: boolean;
  confirmDisabled?: boolean;
  children: React.ReactNode;
}

export const BaseDialog: React.FC<BaseDialogProps> = ({
  zIndex,
  title,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  hideFooter,
  confirmDisabled,
  children,
}) => {
  const showFooter = (onCancel || onConfirm) && !hideFooter;

  return (
    <div
      className={classNames(styles.dialogOverlayRoot)}
      style={{
        zIndex,
      }}
    >
      <div
        className={classNames(styles.dialogBackdrop, {
          [styles.overlayBackground]: true,
          [styles.overlayBackgroundOpacity]: true,
        })}
        onClick={onCancel}
      />
      <div className={classNames(styles.dialogBorder, styles.dialogPanel)}>
        <div className={styles.dialogBody}>
          <h3 className={styles.dialogTitle}>{title}</h3>
          {children}
        </div>

        {showFooter && (
          <div className={styles.dialogFooter} style={{ height: '44px' }}>
            <div className={styles.dialogFooterInner}>
              <button
                className={classNames(styles.dialogFooterButton, styles.dialogFooterCancelButton)}
                onClick={onCancel}
              >
                {cancelText || localize('cancel', 'Cancel')}
              </button>

              <button
                className={classNames(styles.dialogFooterButton, {
                  [styles.dialogFooterConfirmEnabled]: !confirmDisabled,
                  [styles.dialogFooterConfirmDisabled]: confirmDisabled,
                })}
                onClick={onConfirm}
                disabled={confirmDisabled}
              >
                {confirmText || localize('confirm', 'Confirm')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
