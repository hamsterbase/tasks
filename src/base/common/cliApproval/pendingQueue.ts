import { nanoid } from 'nanoid';
import { CLI_APPROVAL_MAX_PENDING, CliApprovalOpRef, CliChangeOp, CliChangeRequest } from './protocol';

/**
 * Give every op a stable id. Refs handed to the UI point at these, so an op
 * keeps its identity when a sibling is approved or rejected out from under
 * it. Ids the CLI happened to send are ignored — the queue owns them.
 */
export function stampOpIds(ops: CliChangeOp[]): CliChangeOp[] {
  return ops.map((op) => ({ ...op, id: nanoid(8) }));
}

function refsByRequest(refs: CliApprovalOpRef[]): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();
  for (const ref of refs) {
    const opIds = result.get(ref.requestId) ?? new Set<string>();
    opIds.add(ref.opId);
    result.set(ref.requestId, opIds);
  }
  return result;
}

/**
 * In-memory queue of change requests waiting for approval. Owned by the
 * Electron main process so pending requests survive window close (macOS
 * Cmd+W) and disappear on quit. No history is kept: approved / rejected
 * requests are simply removed.
 *
 * Deliberately holds no "being applied right now" state. That is a property of
 * the renderer doing the applying, and a renderer can die mid-approve; parking
 * it here would leave ops nobody can release, invisible until the app quits.
 * The renderer guards its own overlapping calls and removes ops once applied,
 * which makes every mutation here idempotent.
 */
export class CliApprovalPendingQueue {
  private readonly requests = new Map<string, CliChangeRequest>();
  private readonly listeners = new Set<() => void>();

  constructor(private readonly maxPending: number = CLI_APPROVAL_MAX_PENDING) {}

  /** returns an error message, or null when accepted */
  add(request: CliChangeRequest): string | null {
    if (this.requests.size >= this.maxPending) {
      return `too many pending requests (max ${this.maxPending})`;
    }
    if (this.requests.has(request.requestId)) {
      return `duplicate requestId: ${request.requestId}`;
    }
    this.requests.set(request.requestId, { ...request, ops: stampOpIds(request.ops) });
    this.notify();
    return null;
  }

  /** drop whole requests; removing something already gone is a no-op */
  remove(requestIds: string[]): void {
    let changed = false;
    for (const requestId of requestIds) {
      changed = this.requests.delete(requestId) || changed;
    }
    if (changed) {
      this.notify();
    }
  }

  /**
   * Drop single ops from their requests; a request with no ops left is removed.
   * Idempotent: the renderer calls this after applying, and a repeat (retry, a
   * second click, a reject racing an approve) finds nothing left to drop.
   */
  removeOps(refs: CliApprovalOpRef[]): void {
    const byRequest = refsByRequest(refs);
    let changed = false;
    for (const [requestId, opIds] of byRequest) {
      const request = this.requests.get(requestId);
      if (!request) {
        continue;
      }
      const ops = request.ops.filter((op) => !op.id || !opIds.has(op.id));
      if (ops.length === request.ops.length) {
        continue;
      }
      changed = true;
      if (ops.length === 0) {
        this.requests.delete(requestId);
      } else {
        this.requests.set(requestId, { ...request, ops });
      }
    }
    if (changed) {
      this.notify();
    }
  }

  list(): CliChangeRequest[] {
    return [...this.requests.values()].sort((a, b) => a.createdAt - b.createdAt);
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of [...this.listeners]) {
      listener();
    }
  }
}
