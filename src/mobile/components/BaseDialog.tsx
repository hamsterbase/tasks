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
      className={classNames('fixed inset-0 flex items-center justify-center')}
      style={{
        zIndex,
      }}
    >
      <div
        className={classNames('absolute inset-0', {
          [styles.overlayBackground]: true,
          [styles.overlayBackgroundOpacity]: true,
        })}
        onClick={onCancel}
      />
      <div
        className={classNames(
          styles.dialogBorder,
          'bg-bg1-float rounded-lg flex flex-col w-80 absolute max-h-[80vh] overflow-y-auto'
        )}
      >
        <div className="flex flex-col p-6 space-y-4">
          <h3 className="text-lg font-medium text-center text-t1">{title}</h3>
          {children}
        </div>

        {showFooter && (
          <div className="border-t border-bg1-float rounded-b-lg" style={{ height: '44px' }}>
            <div className="flex flex-row justify-center items-center h-full px-4">
              <button className="flex-1 text-base text-center text-t1" onClick={onCancel}>
                {cancelText || localize('cancel', 'Cancel')}
              </button>

              <button
                className={classNames('flex-1 text-base text-center', {
                  'text-brand': !confirmDisabled,
                  'text-t3': confirmDisabled,
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
