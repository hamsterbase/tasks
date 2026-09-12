import { readAttachment } from './readAttachment';
import { IAttachmentUploadService } from '@/services/attachment/common/attachmentUploadService';
import { checkPlatform } from '@/base/browser/checkPlatform';
import { stampOpIds } from '@/base/common/cliApproval/pendingQueue';
import { CliApprovalOpRef, CliChangeRequest, CliAttachmentRequest } from '@/base/common/cliApproval/protocol';
import { ITodoService } from '@/services/todo/common/todoService';
import { Emitter } from '@hamsterbase/foundation/event';
import { analyzeRequest, applyChangeOp, CliApprovalRequestView } from '../common/cliApprovalModel';
import { CliApprovalActionResult, ICliApprovalService } from '../common/cliApprovalService';
import { ElectronCliApprovalServiceClient } from '../electron/cliApprovalService-ipc';

/** ui-test injection point: JSON `CliChangeRequest[]` (non-Electron only) */
const MOCK_QUEUE_STORAGE_KEY = 'cliApproval.mockQueue';

function refKey(ref: CliApprovalOpRef): string {
  return `${ref.requestId}:${ref.opId}`;
}

export class WorkbenchCliApprovalService implements ICliApprovalService {
  public readonly _serviceBrand: undefined;

  private readonly _onChange = new Emitter<void>();
  public readonly onChange = this._onChange.event;

  private readonly isElectron = checkPlatform().isElectron;
  private readonly client = new ElectronCliApprovalServiceClient();
  private raw: CliChangeRequest[] = [];
  private reportedDatabaseId: string | null = null;
  /** ops this renderer is applying right now; see {@link reserve} */
  private readonly inFlight = new Set<string>();

  constructor(
    @ITodoService private readonly todoService: ITodoService,
    @IAttachmentUploadService private readonly attachments?: IAttachmentUploadService
  ) {}

  private async readAttachment(request: CliAttachmentRequest): Promise<void> {
    try {
      if (!this.attachments) throw new Error('Attachment service unavailable');
      const attachment = await readAttachment(this.todoService, this.attachments, request);
      await this.client.completeAttachmentRequest({ id: request.id, ok: true, attachment });
    } catch {
      await this.client.completeAttachmentRequest({
        id: request.id,
        ok: false,
        error: 'Cannot read attachment; check the item, active database, storage configuration, and 32 MiB size limit',
      });
    }
  }

  /**
   * The main process keeps one queue for the whole app, so requests for a
   * database that is no longer open can still be in `raw`. Everything that
   * reads or applies the queue must filter, not just the UI: an approval
   * confirmed across a database switch would otherwise land in the wrong one.
   */
  private isVisible(request: CliChangeRequest): boolean {
    return !this.isElectron || request.databaseId === this.todoService.storageId;
  }

  /**
   * Ops that can no longer be applied — the item is gone, or it already holds
   * the values the request would set — are dropped rather than shown. There is
   * nothing to decide about them, and a queue of undecidable rows is worse than
   * an empty one. A request left with no ops disappears with them.
   */
  get requests(): CliApprovalRequestView[] {
    return this.raw
      .filter((request) => this.isVisible(request))
      .map((request) => analyzeRequest(this.todoService.modelState, request))
      .map((request) => ({ ...request, ops: request.ops.filter((op) => op.invalidReason === null) }))
      .filter((request) => request.ops.length > 0);
  }

  async init(): Promise<void> {
    // validation and scope attribution depend on the model, so any model
    // change can change what the approval UI shows
    this.todoService.onStateChange(() => {
      this.reportDatabase();
      this._onChange.fire();
    });

    if (!this.isElectron) {
      this.loadMockQueue();
      return;
    }

    this.client.subscribeAttachments((request) => {
      void this.readAttachment(request);
    });
    this.client.subscribe((requests) => {
      this.raw = requests;
      this._onChange.fire();
    });
    try {
      this.raw = await this.client.listPending();
      this.reportDatabase();
    } catch (error) {
      console.error('Failed to load pending CLI requests:', error);
      this.raw = [];
    }
    this._onChange.fire();
  }

  /**
   * Reserving happens here rather than in the main process on purpose: "being
   * applied right now" belongs to whoever is applying. There is one renderer,
   * so this set is the whole story — and if it dies, nothing needs releasing
   * because the queue was never told anything in the first place.
   */
  private reserve(refs: CliApprovalOpRef[]): CliChangeRequest[] {
    const taken = new Map<string, Set<string>>();
    for (const ref of refs) {
      const key = refKey(ref);
      if (this.inFlight.has(key)) {
        continue;
      }
      const request = this.raw.find((candidate) => candidate.requestId === ref.requestId);
      if (!request || !this.isVisible(request) || !request.ops.some((op) => op.id === ref.opId)) {
        continue;
      }
      this.inFlight.add(key);
      taken.set(ref.requestId, (taken.get(ref.requestId) ?? new Set()).add(ref.opId));
    }
    // queue order: oldest request first, ops in submission order
    return this.raw
      .filter((request) => taken.has(request.requestId))
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((request) => ({
        ...request,
        ops: request.ops.filter((op) => op.id && taken.get(request.requestId)!.has(op.id)),
      }));
  }

  async approve(refs: CliApprovalOpRef[]): Promise<CliApprovalActionResult> {
    const result: CliApprovalActionResult = { applied: [], failed: [] };
    // synchronous, before any await, so two approve() calls in one tick cannot
    // both take the same op
    const reserved = this.reserve(refs);
    if (reserved.length === 0) {
      return result;
    }

    try {
      this.applyReserved(reserved, result);
    } finally {
      for (const request of reserved) {
        for (const op of request.ops) {
          if (op.id) {
            this.inFlight.delete(refKey({ requestId: request.requestId, opId: op.id }));
          }
        }
      }
    }

    // Ops still in the queue after a throw stay pending and can be retried;
    // nothing is stranded either way.
    await this.removeOps([...result.applied, ...result.failed]);
    return result;
  }

  private applyReserved(reserved: CliChangeRequest[], result: CliApprovalActionResult): void {
    for (const request of reserved) {
      let analyzed: CliApprovalRequestView;
      try {
        analyzed = analyzeRequest(this.todoService.modelState, request);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        for (const op of request.ops) {
          if (op.id) {
            const ref = { requestId: request.requestId, opId: op.id };
            result.failed.push({ ...ref, reason });
          }
        }
        continue;
      }
      request.ops.forEach((op, index) => {
        const opId = op.id;
        if (!opId) {
          return;
        }
        const ref = { requestId: request.requestId, opId };
        const view = analyzed.ops[index];
        if (!view) {
          result.failed.push({ ...ref, reason: 'Operation could not be analyzed' });
          return;
        }
        if (view.invalidReason) {
          result.failed.push({ ...ref, reason: view.invalidReason });
          return;
        }
        try {
          applyChangeOp(this.todoService, this.todoService.modelState, op);
          result.applied.push(ref);
        } catch (error) {
          result.failed.push({
            ...ref,
            reason: error instanceof Error ? error.message : String(error),
          });
        }
      });
    }
  }

  async reject(refs: CliApprovalOpRef[]): Promise<void> {
    await this.removeOps(refs);
  }

  private async removeOps(refs: CliApprovalOpRef[]): Promise<void> {
    if (refs.length === 0) {
      return;
    }
    if (this.isElectron) {
      // the queue push echoes the removal back and updates `raw`
      await this.client.removeOps(refs);
      return;
    }
    this.raw = this.raw
      .map((request) => ({
        ...request,
        ops: request.ops.filter((op) => !refs.some((ref) => ref.requestId === request.requestId && ref.opId === op.id)),
      }))
      .filter((request) => request.ops.length > 0);
    this._onChange.fire();
  }

  private reportDatabase(): void {
    if (!this.isElectron) {
      return;
    }
    const databaseId = this.todoService.storageId;
    if (!databaseId || databaseId === this.reportedDatabaseId) {
      return;
    }
    this.reportedDatabaseId = databaseId;
    this.client.reportActiveDatabase(databaseId).catch((error) => {
      console.error('Failed to report active database:', error);
    });
  }

  private loadMockQueue(): void {
    try {
      const rawJson = sessionStorage.getItem(MOCK_QUEUE_STORAGE_KEY);
      if (rawJson) {
        // injected fixtures are hand-written and carry no op ids; the pending
        // queue would have stamped them on the way in
        this.raw = (JSON.parse(rawJson) as CliChangeRequest[]).map((request) => ({
          ...request,
          ops: stampOpIds(request.ops),
        }));
      }
    } catch {
      this.raw = [];
    }
  }
}
