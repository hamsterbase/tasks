import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React, { useState } from 'react';
import { useService } from '../../../hooks/use-service';
import { useWatchEvent } from '../../../hooks/use-watch-event';
import { IWorkbenchOverlayService } from '../../../services/overlay/common/WorkbenchOverlayService';
import { Overlay } from '@/desktop/components/Overlay/Overlay';
import { InputField } from '@/desktop/components/Form/InputField/InputField';
import { DesktopDialogController } from './DesktopDialogController';
import { desktopStyles } from '@/desktop/theme/main';

const DesktopDialogContent: React.FC<{ controller: DesktopDialogController }> = ({ controller }) => {
  const [inputValue, setInputValue] = useState(controller?.actions?.value || '');
  const handleConfirm = () => {
    controller.handleConfirm({
      type: 'input',
      value: inputValue,
    });
  };

  return (
    <Overlay
      title={controller.title}
      onClose={() => controller.handleCancel()}
      onCancel={() => controller.handleCancel()}
      onConfirm={handleConfirm}
      cancelText={controller.cancelText || localize('cancel', 'Cancel')}
      confirmText={controller.confirmText || localize('confirm', 'Confirm')}
      zIndex={controller.zIndex}
    >
      {controller.description && <p className={desktopStyles.DesktopDialogDescription}>{controller.description}</p>}
      {controller.actions?.type === 'input' && (
        <InputField
          type="text"
          placeholder={controller.actions.placeholder || ''}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      )}
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
