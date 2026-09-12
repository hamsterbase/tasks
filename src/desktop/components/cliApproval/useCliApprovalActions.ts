import { CliApprovalOpRef } from '@/base/common/cliApproval/protocol';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ICliApprovalService } from '@/services/cliApproval/common/cliApprovalService';

/** approve / reject with result toasts, shared by the page and the panel */
export function useCliApprovalActions() {
  const cliApprovalService = useService(ICliApprovalService);
  const message = useDesktopMessage();

  const approve = async (refs: CliApprovalOpRef[]) => {
    if (refs.length === 0) {
      return;
    }
    const result = await cliApprovalService.approve(refs);
    if (result.failed.length > 0) {
      message({
        type: 'error',
        message: localize('cliApproval.toast.failed', '{0} change(s) could not be applied', result.failed.length),
        description: result.failed[0].reason,
      });
    } else if (result.applied.length > 0) {
      message({
        type: 'success',
        message: localize('cliApproval.toast.applied', '{0} change(s) applied', result.applied.length),
      });
    }
  };

  const reject = async (refs: CliApprovalOpRef[]) => {
    if (refs.length === 0) {
      return;
    }
    await cliApprovalService.reject(refs);
  };

  return { approve, reject };
}
