import { SquareTerminalIcon } from '@/components/icons';
import { CliApprovalReview } from '@/desktop/components/cliApproval/CliApprovalReview';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { DesktopPage } from '@/desktop/components/DesktopPage';
import { localize } from '@/nls';
import { TestIds } from '@/testIds';
import React from 'react';

export const ApprovalsPage = () => {
  return (
    <DesktopPage
      showDetailPanel={false}
      header={
        <EntityHeader renderIcon={() => <SquareTerminalIcon />} title={localize('cliApproval.title', 'Approvals')} />
      }
    >
      <CliApprovalReview dataTestId={TestIds.CliApproval.Page} showApproveAll showSetupGuide />
    </DesktopPage>
  );
};
