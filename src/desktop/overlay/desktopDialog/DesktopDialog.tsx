import { DialogButtonAction } from '@/base/common/componentsType/dialog';
import { InputField } from '@/desktop/components/Form/InputField/InputField';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';
import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { TestIds } from '@/testIds';
import React from 'react';
import { useService } from '../../../hooks/use-service';
import { useWatchEvent } from '../../../hooks/use-watch-event';
import { IWorkbenchOverlayService } from '../../../services/overlay/common/WorkbenchOverlayService';
import { DesktopDialogController } from './DesktopDialogController';
import { Overlay } from '@/desktop/components/Overlay/Overlay';

const DesktopDialogContent: React.FC<{ controller: DesktopDialogController }> = ({ controller }) => {
  const handleConfirm = () => {
    controller.handleConfirm();
  };

  const handleButtonClick = (action: DialogButtonAction) => {
    controller.handleButtonClick(action);
  };

  return (
    <Overlay
      title={controller.title}
      onClose={() => controller.handleCancel()}
      onCancel={() => controller.handleCancel()}
      onConfirm={handleConfirm}
      hideFooter={controller.hideFooter}
      cancelText={controller.cancelText || localize('cancel', 'Cancel')}
      confirmText={controller.confirmText || localize('confirm', 'Confirm')}
      zIndex={controller.zIndex}
    >
      {controller.description && (
        <p className={desktopStyles.DesktopDialogDescription} data-test-id={TestIds.DesktopDialog.Description}>
          {controller.description}
        </p>
      )}
      <div className={desktopStyles.DesktopDialogActionsContainer}>
        {controller.actions?.map((action) => {
          if (action.type === 'input') {
            const error = controller.errors[action.key];
            return (
              <div key={action.key} className="flex flex-col space-y-1">
                {action.label && (
                  <label className="text-sm font-medium text-t1">
                    {action.label}
                    {action.required && <span className="text-stress-red ml-1">*</span>}
                  </label>
                )}
                <InputField
                  type={action.inputType}
                  placeholder={action.placeholder || ''}
                  value={(controller.actionValues[action.key] as string) || ''}
                  onChange={(e) => controller.updateActionValue(action.key, e.target.value)}
                />
                {error && <span className="text-sm text-stress-red">{error}</span>}
              </div>
            );
          } else if (action.type === 'button') {
            return (
              <SettingButton
                key={action.key}
                size={action.size}
                variant={action.variant}
                color={action.color}
                onClick={() => handleButtonClick(action)}
                data-test-id={TestIds.DesktopDialog.ActionButton}
                data-test-key={action.key}
              >
                {action.label}
              </SettingButton>
            );
          }
          return null;
        })}
      </div>
    </Overlay>
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
