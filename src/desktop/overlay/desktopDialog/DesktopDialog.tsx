import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React, { useState } from 'react';
import { useService } from '../../../hooks/use-service';
import { useWatchEvent } from '../../../hooks/use-watch-event';
import { IWorkbenchOverlayService } from '../../../services/overlay/common/WorkbenchOverlayService';
import { Overlay } from '@/desktop/components/Overlay/Overlay';
import { InputField } from '@/desktop/components/Form/InputField/InputField';
import { DesktopDialogController, DialogButtonAction } from './DesktopDialogController';
import { desktopStyles } from '@/desktop/theme/main';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';

const DesktopDialogContent: React.FC<{ controller: DesktopDialogController }> = ({ controller }) => {
  const [actionValues, setActionValues] = useState<Record<string, string | boolean>>(() => {
    const initialValues: Record<string, string | boolean> = {};
    controller?.actions?.forEach((action) => {
      if (action.type === 'input') {
        initialValues[action.key] = action.value || '';
      }
    });
    return initialValues;
  });

  const handleConfirm = () => {
    controller.handleConfirm(actionValues);
  };

  const handleButtonClick = (action: DialogButtonAction) => {
    if (action.onclick) {
      try {
        const result = action.onclick(actionValues);
        if (result instanceof Promise) {
          result
            .then(() => {
              controller.handleCancel();
            })
            .catch(() => {});
        } else {
          controller.handleCancel();
        }
      } catch {
        // do nothing
      }
    } else {
      controller.handleCancel();
    }
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
      {controller.description && <p className={desktopStyles.DesktopDialogDescription}>{controller.description}</p>}
      <div className={desktopStyles.DesktopDialogActionsContainer}>
        {controller.actions?.map((action) => {
          if (action.type === 'input') {
            return (
              <InputField
                key={action.key}
                type="text"
                placeholder={action.placeholder || ''}
                value={(actionValues[action.key] as string) || ''}
                onChange={(e) => setActionValues((prev) => ({ ...prev, [action.key]: e.target.value }))}
              />
            );
          } else if (action.type === 'button') {
            return (
              <SettingButton
                key={action.key}
                size={action.size}
                variant={action.variant}
                color={action.color}
                onClick={() => handleButtonClick(action)}
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
