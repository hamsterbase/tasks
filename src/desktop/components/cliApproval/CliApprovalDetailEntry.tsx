import { SquareTerminalIcon } from '@/components/icons';
import { TaskDetailAttributeRow } from '@/desktop/components/selectionPanel/components/TaskDetailAttributeRow';
import { CliApprovalPanelController } from '@/desktop/overlay/cliApprovalPanel/CliApprovalPanelController';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ICliApprovalService } from '@/services/cliApproval/common/cliApprovalService';
import { TestIds } from '@/testIds';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import React from 'react';

export const CliApprovalDetailEntry: React.FC<{ scopeUid: string }> = ({ scopeUid }) => {
  const cliApprovalService = useService(ICliApprovalService);
  const instantiationService = useService(IInstantiationService);
  useWatchEvent(cliApprovalService.onChange);

  const count = cliApprovalService.requests
    .flatMap((request) => request.ops)
    .filter((op) => op.scope?.uid === scopeUid).length;

  return (
    <TaskDetailAttributeRow
      dataTestId={TestIds.CliApproval.DetailEntry}
      icon={<SquareTerminalIcon />}
      label={localize('cliApproval.title', 'Approvals')}
      content={count}
      placeholder={count === 0}
      onClick={() => CliApprovalPanelController.create({ scopeUid }, instantiationService)}
    />
  );
};
