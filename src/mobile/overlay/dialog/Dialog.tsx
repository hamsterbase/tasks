import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React, { useState } from 'react';
import { useService } from '../../../hooks/use-service';
import { useWatchEvent } from '../../../hooks/use-watch-event';
import { IWorkbenchOverlayService } from '../../../services/overlay/common/WorkbenchOverlayService';
import { DialogController } from './DialogController';
import classNames from 'classnames';
import { styles } from '@/mobile/theme';

const DialogContent: React.FC<{ controller: DialogController }> = ({ controller }) => {
  const [inputValue, setInputValue] = useState(controller?.actions?.value || '');
  const handleConfirm = () => {
    controller.handleConfirm({
      type: 'input',
      value: inputValue,
    });
  };
  return (
    <div
      className={classNames('fixed inset-0 flex items-center justify-center')}
      style={{
        zIndex: controller.zIndex,
      }}
    >
      <div
        className={classNames('absolute inset-0', {
          [styles.overlayBackground]: true,
          [styles.overlayBackgroundOpacity]: true,
        })}
      />
      <div className={classNames(styles.dialogBorder, 'bg-bg1-float rounded-lg flex flex-col w-70 absolute')}>
        <div className="flex flex-col items-center p-0 pb-6 gap-3">
          <div className="flex flex-col items-center px-5 gap-1.5 w-full">
            <h3 className="text-base font-medium text-center text-t1 mt-6">{controller.title}</h3>

            {controller.description && (
              <p className="text-sm text-center text-t2 whitespace-pre-line">{controller.description}</p>
            )}

            {controller.actions?.type === 'input' && (
              <div className="w-full mt-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-bg2-float bg-bg2-float rounded-md text-t1 outline-none"
                  placeholder={controller.actions.placeholder || ''}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-bg1-float rounded-b-lg" style={{ height: '44px' }}>
          <div className="flex flex-row justify-center items-center h-full px-4">
            {
              <button className="flex-1 text-base text-center text-t1" onClick={() => controller.handleCancel()}>
                {controller.cancelText || localize('cancel', 'Cancel')}
              </button>
            }

            {
              <button className="flex-1 text-base text-center text-brand" onClick={handleConfirm}>
                {controller.confirmText || localize('confirm', 'Confirm')}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export const Dialog: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: DialogController | null = workbenchOverlayService.getOverlay(OverlayEnum.dialog);
  useWatchEvent(controller?.onStatusChange);
  if (!controller) return null;

  return <DialogContent controller={controller} />;
};
