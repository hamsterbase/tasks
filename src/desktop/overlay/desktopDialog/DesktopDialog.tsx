import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React, { useState } from 'react';
import { useService } from '../../../hooks/use-service';
import { useWatchEvent } from '../../../hooks/use-watch-event';
import { IWorkbenchOverlayService } from '../../../services/overlay/common/WorkbenchOverlayService';
import { DesktopDialogController } from './DesktopDialogController';

const DesktopDialogContent: React.FC<{ controller: DesktopDialogController }> = ({ controller }) => {
  const [inputValue, setInputValue] = useState(controller?.actions?.value || '');
  const handleConfirm = () => {
    controller.handleConfirm({
      type: 'input',
      value: inputValue,
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: controller.zIndex,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-45" />

      <div className="bg-bg1-float rounded-lg shadow-2xl flex flex-col min-w-96 max-w-lg mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg2-float">
          <h3 className="text-lg font-semibold text-t1">{controller.title}</h3>
          <button onClick={() => controller.handleCancel()} className="text-t3 hover:text-t2 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.207 4.793a1 1 0 0 1 0 1.414L9.414 9l2.793 2.793a1 1 0 0 1-1.414 1.414L8 10.414l-2.793 2.793a1 1 0 0 1-1.414-1.414L6.586 9 3.793 6.207a1 1 0 0 1 1.414-1.414L8 7.586l2.793-2.793a1 1 0 0 1 1.414 0z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {controller.description && <p className="text-sm text-t2 mb-4 leading-relaxed">{controller.description}</p>}

          {controller.actions?.type === 'input' && (
            <div>
              <input
                type="text"
                className="w-full px-3 py-2 border border-bg2-float bg-bg2-float rounded text-t1 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                placeholder={controller.actions.placeholder || ''}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 rounded-b-lg">
          <button
            className="px-4 py-2 text-sm font-medium text-t1 bg-bg1-float border border-bg2-float rounded focus:outline-none hover:ring-1 hover:ring-brand transition-colors"
            onClick={() => controller.handleCancel()}
          >
            {controller.cancelText || localize('cancel', 'Cancel')}
          </button>

          <button
            className="px-4 py-2 text-sm font-medium text-white bg-brand border border-brand rounded hover:bg-brand-hover focus:outline-none transition-colors"
            onClick={handleConfirm}
          >
            {controller.confirmText || localize('confirm', 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const DesktopDialog: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: DesktopDialogController | null = workbenchOverlayService.getOverlay(OverlayEnum.dialog);
  useWatchEvent(controller?.onStatusChange);
  if (!controller) return null;

  return <DesktopDialogContent controller={controller} />;
};
