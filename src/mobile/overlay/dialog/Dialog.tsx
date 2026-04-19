import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import classNames from 'classnames';
import React from 'react';
import { useService } from '../../../hooks/use-service';
import { useWatchEvent } from '../../../hooks/use-watch-event';
import { IWorkbenchOverlayService } from '../../../services/overlay/common/WorkbenchOverlayService';
import { BaseDialog } from '../../components/BaseDialog';
import { styles } from '../../theme';
import { DialogController } from './DialogController';

const DialogContent: React.FC<{ controller: DialogController }> = ({ controller }) => {
  return (
    <BaseDialog
      zIndex={controller.zIndex}
      title={controller.title}
      cancelText={controller.cancelText}
      confirmText={controller.confirmText}
      onCancel={() => controller.handleCancel()}
      onConfirm={() => controller.handleConfirm()}
      hideFooter={controller.hideFooter}
    >
      {controller.description && <p className={styles.dialogDescription}>{controller.description}</p>}

      {controller.actions && (
        <div className={styles.dialogActionList}>
          {controller.actions.map((action) => {
            if (action.type === 'input') {
              return (
                <div key={action.key}>
                  {action.label && (
                    <label className={styles.dialogFieldLabel}>
                      {action.label}
                      {action.required && <span className={styles.dialogRequiredMark}>*</span>}
                    </label>
                  )}
                  <input
                    type={action.inputType || 'text'}
                    className={classNames(styles.dialogInput, {
                      [styles.dialogInputNormal]: !controller.errors[action.key],
                      [styles.dialogInputError]: controller.errors[action.key],
                    })}
                    placeholder={action.placeholder || ''}
                    value={(controller.actionValues[action.key] as string) || ''}
                    onChange={(e) => controller.updateActionValue(action.key, e.target.value)}
                  />
                  {controller.errors[action.key] && (
                    <p className={styles.dialogFieldError}>{controller.errors[action.key]}</p>
                  )}
                </div>
              );
            } else if (action.type === 'button') {
              return (
                <button
                  key={action.key}
                  className={classNames(styles.dialogButton, {
                    [styles.dialogButtonPrimary]: action.color === 'primary',
                    [styles.dialogButtonDanger]: action.color === 'danger',
                    [styles.dialogButtonDefault]: !action.color,
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
    </BaseDialog>
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
