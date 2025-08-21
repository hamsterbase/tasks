import React from 'react';
import { CloseIcon } from '@/components/icons';
import { SettingButton } from '../Settings/Button/Button';

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
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-45" />

      <div className="bg-bg1-float rounded-lg shadow-2xl flex flex-col min-w-96 max-w-lg mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg2-float">
          <h3 className="text-lg font-semibold text-t1">{title}</h3>
          <button onClick={onClose} className="text-t3 hover:text-t2 transition-colors">
            <CloseIcon width="16" height="16" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {(onCancel || onConfirm) && (
          <div className="flex justify-end gap-2 px-6 py-4 rounded-b-lg">
            {onCancel && (
              <SettingButton variant="default" size="medium" inline onClick={onCancel} disabled={cancelDisabled}>
                {cancelText || 'Cancel'}
              </SettingButton>
            )}

            {onConfirm && (
              <SettingButton
                variant="solid"
                color="primary"
                size="medium"
                inline
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
