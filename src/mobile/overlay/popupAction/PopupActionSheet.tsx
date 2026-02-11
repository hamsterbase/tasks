import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ActionSheet } from '@/mobile/components/ActionSheet';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import React from 'react';
import { PopupActionController } from './PopupActionController';

export const PopupActionSheet: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: PopupActionController | null = workbenchOverlayService.getOverlay(OverlayEnum.popupAction);
  useWatchEvent(controller?.onStatusChange);

  if (!controller) return null;

  const groups = controller.groups;

  return (
    <ActionSheet zIndex={controller.zIndex} onClose={() => controller.dispose()}>
      {controller.description && <div className="text-sm text-t3 mb-2">{controller.description}</div>}
      {groups.map((group, groupIndex) => (
        <ListItemGroup
          key={groupIndex}
          items={group.items.map((item) => ({
            icon: item.icon,
            title: item.name,
            description: item.description,
            mode: { type: 'plain' as const },
            onClick: () => {
              item.onClick();
              controller.dispose();
            },
          }))}
        />
      ))}
    </ActionSheet>
  );
};
