import { CloseIcon } from '@/components/icons';
import { CliApprovalReview } from '@/desktop/components/cliApproval/CliApprovalReview';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { TestIds } from '@/testIds';
import React from 'react';
import { CliApprovalPanelController } from './CliApprovalPanelController';

const PanelContent: React.FC<{ controller: CliApprovalPanelController }> = ({ controller }) => {
  return (
    <div className="fixed inset-0" style={{ zIndex: controller.zIndex }}>
      <div className="absolute inset-0" onClick={() => controller.dispose()}></div>
      <div
        data-test-id={TestIds.CliApproval.PanelContainer}
        className="absolute top-0 right-0 bottom-0 flex w-128 flex-col border-l border-line-light bg-bg1 shadow-xl"
      >
        <div className="flex items-center gap-2 border-b border-line-light px-4 py-3">
          <span className="flex-1 text-sm font-semibold text-t1">
            {localize('cliApproval.panel.title', 'Pending approvals')}
          </span>
          <button
            className="cursor-pointer rounded-md p-1 text-t3 transition-colors hover:bg-bg2"
            onClick={() => controller.dispose()}
          >
            <CloseIcon className="size-4" />
          </button>
        </div>

        <CliApprovalReview scopeUid={controller.scopeUid} comfortablePadding showApproveAll />
      </div>
    </div>
  );
};

export const CliApprovalPanelOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: CliApprovalPanelController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.cliApprovalPanel
  );
  if (!controller) return null;

  return <PanelContent controller={controller} />;
};
