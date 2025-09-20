import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import classNames from 'classnames';
import React from 'react';
import { useService } from '../../../hooks/use-service';
import { useWatchEvent } from '../../../hooks/use-watch-event';
import { IWorkbenchOverlayService } from '../../../services/overlay/common/WorkbenchOverlayService';
import { DialogController } from './DialogController';

const DialogContent: React.FC<{ controller: DialogController }> = ({ controller }) => {
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
        onClick={() => controller.handleCancel()}
      />
      <div
        className={classNames(
          styles.dialogBorder,
          'bg-bg1-float rounded-lg flex flex-col w-80 absolute max-h-[80vh] overflow-y-auto'
        )}
      >
        <div className="flex flex-col p-6 space-y-4">
          <h3 className="text-lg font-medium text-center text-t1">{controller.title}</h3>

          {controller.description && (
            <p className="text-sm text-center text-t2 whitespace-pre-line">{controller.description}</p>
          )}

          {controller.actions && (
            <div className="space-y-4">
              {controller.actions.map((action) => {
                if (action.type === 'input') {
                  return (
                    <div key={action.key}>
                      {action.label && (
                        <label className="block text-sm font-medium text-t1 mb-2">
                          {action.label}
                          {action.required && <span className="text-stress-red ml-1">*</span>}
                        </label>
                      )}
                      <input
                        type={action.inputType || 'text'}
                        className={classNames(
                          'w-full px-3 py-2 border bg-bg2-float rounded-md text-t1 outline-none transition-colors',
                          {
                            'border-bg2-float focus:border-brand': !controller.errors[action.key],
                            'border-stress-red': controller.errors[action.key],
                          }
                        )}
                        placeholder={action.placeholder || ''}
                        value={(controller.actionValues[action.key] as string) || ''}
                        onChange={(e) => controller.updateActionValue(action.key, e.target.value)}
                      />
                      {controller.errors[action.key] && (
                        <p className="text-xs text-stress-red mt-1">{controller.errors[action.key]}</p>
                      )}
                    </div>
                  );
                } else if (action.type === 'button') {
                  return (
                    <button
                      key={action.key}
                      className={classNames('w-full py-2 px-4 rounded-md text-center font-medium', {
                        'bg-brand text-white': action.color === 'primary',
                        'bg-stress-red text-white': action.color === 'danger',
                        'bg-bg2 text-t1': !action.color,
                      })}
                      onClick={() => controller.handleButtonClick(action)}
                    >
                      {action.label}
                    </button>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>

        {!controller.hideFooter && (
          <div className="border-t border-bg1-float rounded-b-lg" style={{ height: '44px' }}>
            <div className="flex flex-row justify-center items-center h-full px-4">
              <button className="flex-1 text-base text-center text-t1" onClick={() => controller.handleCancel()}>
                {controller.cancelText || localize('cancel', 'Cancel')}
              </button>

              <button className="flex-1 text-base text-center text-brand" onClick={() => controller.handleConfirm()}>
                {controller.confirmText || localize('confirm', 'Confirm')}
              </button>
            </div>
          </div>
        )}
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
