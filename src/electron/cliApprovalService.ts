import {
  CliAttachmentRequest,
  CliApprovalOpRef,
  CliChangeRequest,
  CliInstanceInfo,
  CLI_PROTOCOL_VERSION,
  CliSocketRequest,
  CliSocketResponse,
  NdjsonDecoder,
  serializeMessage,
  validateChangeRequest,
} from '@/base/common/cliApproval/protocol';
import { CliApprovalPendingQueue } from '@/base/common/cliApproval/pendingQueue';
import * as fsSync from 'fs';
import * as fs from 'fs/promises';
import { nanoid } from 'nanoid';
import * as net from 'net';
import * as os from 'os';
import * as path from 'path';

export interface ICliApprovalHost {
  onQueueChanged(requests: CliChangeRequest[]): void;
  onRequestArrived(): void;
  onAttachmentRequest?(request: CliAttachmentRequest): void;
}

/**
 * Main-process side of the CLI approval flow: listens on a local socket for
 * change requests submitted by the CLI and keeps them in memory until the
 * renderer approves or rejects them.
 *
 * The socket itself lives in the OS temp dir (unix socket paths are limited
 * to ~104 bytes; the MAS container data dir exceeds that). The CLI finds it
 * through a discovery file written to `<dataDir>/ipc/<instanceId>.json`.
 */
export class ElectronCliApprovalService {
  private readonly instanceId = nanoid(8);
  private readonly queue = new CliApprovalPendingQueue();
  private server: net.Server | null = null;
  private activeDatabaseId = '';
  private readonly attachmentRequests = new Map<
    string,
    { databaseId: string; resolve: (response: CliSocketResponse) => void }
  >();

  completeAttachmentRequest(response: CliSocketResponse): void {
    const pending = this.attachmentRequests.get(response.id);
    if (!pending) return;
    pending.resolve(
      pending.databaseId === this.activeDatabaseId
        ? response
        : {
            id: response.id,
            ok: false,
            error: 'The active database changed; try again',
          }
    );
  }

  private async readAttachment(request: CliAttachmentRequest): Promise<CliSocketResponse> {
    if (
      !request.databaseId ||
      request.databaseId !== this.activeDatabaseId ||
      typeof request.parentUid !== 'string' ||
      !request.parentUid ||
      typeof request.attachmentId !== 'string' ||
      !request.attachmentId
    ) {
      return { id: request.id, ok: false, error: 'Invalid attachment request or database mismatch' };
    }
    // Internal correlation ids cannot collide across CLI connections.
    const internalId = nanoid();
    return new Promise((resolve) => {
      const timer = setTimeout(
        () => finish({ id: internalId, ok: false, error: 'Desktop window unavailable; open it and try again' }),
        120000
      );
      const finish = (response: CliSocketResponse) => {
        clearTimeout(timer);
        this.attachmentRequests.delete(internalId);
        resolve({ ...response, id: request.id });
      };
      this.attachmentRequests.set(internalId, { databaseId: request.databaseId, resolve: finish });
      this.host.onAttachmentRequest?.({ ...request, id: internalId });
    });
  }

  constructor(
    private readonly basePath: string,
    private readonly host: ICliApprovalHost,
    /** reported to the CLI so it can name this version when asking for an update */
    private readonly appVersion: string = ''
  ) {
    this.queue.onChange(() => this.host.onQueueChanged(this.queue.list()));
  }

  private get ipcDir(): string {
    return path.join(this.basePath, 'ipc');
  }

  private get infoPath(): string {
    return path.join(this.ipcDir, `${this.instanceId}.json`);
  }

  private get socketPath(): string {
    if (process.platform === 'win32') {
      return `\\\\.\\pipe\\hamsterbase-tasks-${this.instanceId}`;
    }
    return path.join(os.tmpdir(), `hamsterbase-tasks-${this.instanceId}.sock`);
  }

  async start(): Promise<void> {
    await fs.mkdir(this.ipcDir, { recursive: true });
    await this.cleanStaleInfoFiles();
    this.server = net.createServer((socket) => this.handleConnection(socket));
    await new Promise<void>((resolve, reject) => {
      const server = this.server!;
      server.once('error', reject);
      server.listen(this.socketPath, () => {
        server.removeListener('error', reject);
        resolve();
      });
    });
    await this.writeInfoFile();
  }

  /** synchronous on purpose: called from electron's will-quit */
  disposeSync(): void {
    try {
      this.server?.close();
    } catch {
      // ignore
    }
    try {
      fsSync.rmSync(this.infoPath, { force: true });
    } catch {
      // ignore
    }
    if (process.platform !== 'win32') {
      try {
        fsSync.rmSync(this.socketPath, { force: true });
      } catch {
        // ignore
      }
    }
  }

  // --- renderer-facing methods, invoked through service-channel-call ---

  listPending(): CliChangeRequest[] {
    return this.queue.list();
  }

  removeRequests(requestIds: string[]): void {
    this.queue.remove(requestIds);
  }

  removeOps(refs: CliApprovalOpRef[]): void {
    this.queue.removeOps(refs);
  }

  async reportActiveDatabase(databaseId: string): Promise<void> {
    this.activeDatabaseId = databaseId;
    await this.writeInfoFile();
  }

  // --- socket handling ---

  private handleConnection(socket: net.Socket): void {
    const decoder = new NdjsonDecoder();
    socket.setEncoding('utf8');
    socket.on('data', (chunk: string) => {
      for (const message of decoder.append(chunk)) {
        void this.handleMessage(message).then((response) => {
          if (!socket.destroyed) socket.write(serializeMessage(response));
        });
      }
    });
    socket.on('error', () => {
      // client went away; nothing to do
    });
  }

  private async handleMessage(message: { value?: unknown; error?: string }): Promise<CliSocketResponse> {
    if (message.error || !message.value || typeof message.value !== 'object') {
      return { id: '', ok: false, error: message.error ?? 'invalid message' };
    }
    const value = message.value as Partial<CliSocketRequest>;
    const id = typeof value.id === 'string' ? value.id : '';
    if (value.type === 'read-attachment') return this.readAttachment(value as CliAttachmentRequest);
    if (value.type !== 'submit') {
      return { id, ok: false, error: `unknown message type: ${String(value.type)}` };
    }
    const validationError = validateChangeRequest(value.request);
    if (validationError) {
      return { id, ok: false, error: validationError };
    }
    const request = value.request as CliChangeRequest;
    if (this.activeDatabaseId && request.databaseId !== this.activeDatabaseId) {
      return {
        id,
        ok: false,
        error: `client has database '${this.activeDatabaseId}' open, request targets '${request.databaseId}'`,
      };
    }
    const addError = this.queue.add(request);
    if (addError) {
      return { id, ok: false, error: addError };
    }
    this.host.onRequestArrived();
    return { id, ok: true };
  }

  // --- discovery file ---

  private async writeInfoFile(): Promise<void> {
    const info: CliInstanceInfo = {
      instanceId: this.instanceId,
      pid: process.pid,
      socketPath: this.socketPath,
      databaseId: this.activeDatabaseId,
      startedAt: Date.now(),
      protocolVersion: CLI_PROTOCOL_VERSION,
      appVersion: this.appVersion,
    };
    await fs.writeFile(this.infoPath, JSON.stringify(info), 'utf8');
  }

  /** remove discovery files whose process is gone (crashes leave them behind) */
  private async cleanStaleInfoFiles(): Promise<void> {
    let entries: string[];
    try {
      entries = await fs.readdir(this.ipcDir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.endsWith('.json')) {
        continue;
      }
      const filePath = path.join(this.ipcDir, entry);
      let stale = false;
      try {
        const info = JSON.parse(await fs.readFile(filePath, 'utf8')) as CliInstanceInfo;
        process.kill(info.pid, 0);
      } catch {
        stale = true;
      }
      if (stale) {
        await fs.rm(filePath, { force: true });
      }
    }
  }
}
