import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ActionSheet } from '@/mobile/components/ActionSheet';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import React from 'react';
import { PopupActionController } from './PopupActionController';
import classNames from 'classnames';
import { styles } from '@/mobile/theme';
export const PopupActionSheet: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: PopupActionController | null = workbenchOverlayService.getOverlay(OverlayEnum.popupAction);
  useWatchEvent(controller?.onStatusChange);

  if (!controller) return null;

  const items = controller.items;

  return (
    <ActionSheet zIndex={controller.zIndex} onClose={() => controller.dispose()}>
      {controller.description && <div className="text-sm text-t3 mb-2">{controller.description}</div>}
      <div
        className={classNames('w-full', styles.actionSheetActionGroupRound, styles.actionSheetActionGroupBackground)}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <button
              className={classNames(
                'w-full flex items-center',
                styles.actionSheetActionGroupItemPadding,
                styles.actionSheetActionGroupItemGap
              )}
              onClick={() => {
                item.onClick();
                controller.dispose();
              }}
            >
              {item.icon && (
                <span className="flex-shrink-0 size-5 flex items-center justify-center text-t1">{item.icon}</span>
              )}
              <div className="flex flex-col gap-0.5 justify-start">
                <span className="text-sm text-t1 text-start">{item.name}</span>
                {item.description && <span className="text-xs text-t3">{item.description}</span>}
              </div>
            </button>
            {index !== items.length - 1 && <div className="w-[calc(100%-2.5rem)] h-px bg-line-light ml-auto" />}
          </React.Fragment>
        ))}
      </div>
    </ActionSheet>
  );
};
