import { createDecorator } from '@hamsterbase/foundation/instantiation';
import { Event } from '@hamsterbase/foundation/event';
import { CliApprovalOpRef } from '@/base/common/cliApproval/protocol';
import { CliApprovalRequestView } from './cliApprovalModel';

export interface CliApprovalActionResult {
  applied: CliApprovalOpRef[];
  failed: Array<CliApprovalOpRef & { reason: string }>;
}

/**
 * Renderer side of the CLI approval flow. The Electron main process owns the
 * pending queue (requests survive window close, disappear on quit); this
 * service mirrors it, validates requests against the live model and applies
 * them on approval. Outside Electron it stays empty (except for an explicit
 * ui-test injection).
 *
 * Approval is op-granular: every entry the user acts on is one op of a
 * pending request, referenced as `{ requestId, opId }`.
 */
export interface ICliApprovalService {
  readonly _serviceBrand: undefined;

  /** fires when the queue or the validation result changes */
  onChange: Event<void>;

  /** pending requests for the currently open database, oldest first */
  readonly requests: CliApprovalRequestView[];

  init(): Promise<void>;

  /** apply approved ops; failures are reported per op */
  approve(refs: CliApprovalOpRef[]): Promise<CliApprovalActionResult>;

  /** discard ops without applying them */
  reject(refs: CliApprovalOpRef[]): Promise<void>;
}

export const ICliApprovalService = createDecorator<ICliApprovalService>('cliApprovalService');
