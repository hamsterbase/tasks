import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { flattenRequestOps } from '@/services/cliApproval/common/cliApprovalModel';
import { ICliApprovalService } from '@/services/cliApproval/common/cliApprovalService';
import { ITodoService } from '@/services/todo/common/todoService';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
import React from 'react';
import { CliApprovalOpRow } from './CliApprovalOpRow';
import { CliApprovalSetupGuide } from './CliApprovalSetupGuide';
import { useCliApprovalActions } from './useCliApprovalActions';

interface CliApprovalReviewProps {
  scopeUid?: string;
  dataTestId?: string;
  comfortablePadding?: boolean;
  showApproveAll?: boolean;
  /** Replaces the bare "nothing pending" line with the CLI setup instructions. */
  showSetupGuide?: boolean;
}

export const CliApprovalReview: React.FC<CliApprovalReviewProps> = ({
  scopeUid,
  dataTestId,
  comfortablePadding = false,
  showApproveAll = false,
  showSetupGuide = false,
}) => {
  const cliApprovalService = useService(ICliApprovalService);
  const todoService = useService(ITodoService);
  useWatchEvent(cliApprovalService.onChange);
  useWatchEvent(todoService.onStateChange);

  const dialog = useDesktopDialog();
  const { approve, reject } = useCliApprovalActions();
  const entries = flattenRequestOps(cliApprovalService.requests).filter(
    (entry) => !scopeUid || entry.op.scope?.uid === scopeUid
  );
  const bulkApprovableRefs = entries
    .filter((entry) => entry.op.invalidReason === null && entry.op.kind !== 'delete')
    .map((entry) => ({ requestId: entry.requestId, opId: entry.opId }));
  const confirmationRequiredCount = entries.filter(
    (entry) => entry.op.invalidReason === null && entry.op.kind === 'delete'
  ).length;
  const allRefs = entries.map((entry) => ({ requestId: entry.requestId, opId: entry.opId }));

  const handleApproveAll = () => {
    dialog({
      title: localize('cliApproval.approveAll.title', 'Approve all requests'),
      description:
        confirmationRequiredCount > 0
          ? localize(
              'cliApproval.approveAll.descriptionWithConfirmation',
              'Apply {0} pending change(s)? {1} deletion request(s) will remain for separate confirmation.',
              bulkApprovableRefs.length,
              confirmationRequiredCount
            )
          : localize(
              'cliApproval.approveAll.description',
              'Apply {0} pending change(s) from the CLI?',
              bulkApprovableRefs.length
            ),
      confirmText: localize('cliApproval.approveAll', 'Approve All'),
      cancelText: localize('cancel', 'Cancel'),
      onConfirm: () => approve(bulkApprovableRefs),
    });
  };

  const handleApproveEntry = (entry: (typeof entries)[number]) => {
    const refs = [{ requestId: entry.requestId, opId: entry.opId }];
    if (entry.op.kind !== 'delete') {
      return approve(refs);
    }

    const entityTitle = entry.op.entity?.title || entry.op.unresolvedUid || entry.op.action;
    dialog({
      title: localize('cliApproval.confirmDelete.title', 'Approve deletion'),
      description: localize(
        'cliApproval.confirmDelete.description',
        'Delete "{0}"? This action cannot be undone.',
        entityTitle
      ),
      confirmText: localize('cliApproval.confirmDelete.confirm', 'Approve Delete'),
      cancelText: localize('cancel', 'Cancel'),
      onConfirm: () => approve(refs),
    });
  };

  const handleRejectAll = () => {
    dialog({
      title: localize('cliApproval.rejectAll.title', 'Reject all requests'),
      description: localize(
        'cliApproval.rejectAll.description',
        'Reject {0} pending change(s) from the CLI?',
        allRefs.length
      ),
      confirmText: localize('cliApproval.rejectAll', 'Reject All'),
      cancelText: localize('cancel', 'Cancel'),
      onConfirm: () => reject(allRefs),
    });
  };

  // The setup guide replaces the list entirely, and both bulk buttons would be
  // dead controls next to it.
  const showActionBar = !(showSetupGuide && entries.length === 0);

  return (
    <div className="flex h-full min-h-0 flex-col" data-test-id={dataTestId}>
      <div className={classNames('min-h-0 flex-1 overflow-y-auto py-2', comfortablePadding ? 'px-4' : 'px-2')}>
        <div className="w-full">
          {entries.length === 0 ? (
            showSetupGuide ? (
              <CliApprovalSetupGuide />
            ) : (
              <div className="py-12 text-center text-sm text-t3">
                {localize('cliApproval.empty', 'No pending approvals')}
              </div>
            )
          ) : (
            <div className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-5 divide-y divide-line-light">
              {entries.map((entry) => (
                <CliApprovalOpRow
                  key={`${entry.requestId}:${entry.opId}`}
                  entry={entry}
                  onApprove={() => handleApproveEntry(entry)}
                  onReject={() => reject([{ requestId: entry.requestId, opId: entry.opId }])}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showActionBar && (
        <div
          className={classNames(
            // No bottom padding on the page: DesktopPageMainContent already ends
            // in pb-3, and doubling it pushes the bar off the fold. The panel has
            // no such wrapper, so it pays for its own.
            'shrink-0 border-t border-line-light bg-bg1 pt-3',
            comfortablePadding ? 'px-4 pb-3' : 'px-2 pb-0'
          )}
        >
          <div className="flex w-full items-center gap-2">
            {showApproveAll && (
              <button
                data-test-id={TestIds.CliApproval.ApproveAllButton}
                className="cursor-pointer rounded-md bg-brand px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                disabled={bulkApprovableRefs.length === 0}
                onClick={handleApproveAll}
              >
                {localize('cliApproval.approveAll', 'Approve All')}
              </button>
            )}
            <button
              data-test-id={TestIds.CliApproval.RejectAllButton}
              className="cursor-pointer rounded-md px-3 py-1 text-xs font-medium text-t2 transition-colors hover:bg-bg2 hover:text-accent-danger disabled:pointer-events-none disabled:opacity-50"
              disabled={allRefs.length === 0}
              onClick={handleRejectAll}
            >
              {localize('cliApproval.rejectAll', 'Reject All')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
