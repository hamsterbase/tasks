import {
  CliApprovalOpRef,
  CliChangeRequest,
  CliAttachmentRequest,
  CliSocketResponse,
} from '@/base/common/cliApproval/protocol';

/** renderer → main calls plus the queue push subscription */
export class ElectronCliApprovalServiceClient {
  private readonly serviceName = 'cliApprovalService';

  private async call<T>(method: string, args: unknown[]): Promise<T> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.serviceChannel.call({ serviceName: this.serviceName, method, args }) as Promise<T>;
  }

  async listPending(): Promise<CliChangeRequest[]> {
    return this.call('listPending', []);
  }

  async removeRequests(requestIds: string[]): Promise<void> {
    return this.call('removeRequests', [requestIds]);
  }

  async removeOps(refs: CliApprovalOpRef[]): Promise<void> {
    return this.call('removeOps', [refs]);
  }

  async reportActiveDatabase(databaseId: string): Promise<void> {
    return this.call('reportActiveDatabase', [databaseId]);
  }

  async completeAttachmentRequest(response: CliSocketResponse): Promise<void> {
    return this.call('completeAttachmentRequest', [response]);
  }

  subscribeAttachments(callback: (request: CliAttachmentRequest) => void): void {
    window.electronAPI?.serviceChannel.on('cli-attachment-request', (data) => callback(data as CliAttachmentRequest));
  }

  subscribe(callback: (requests: CliChangeRequest[]) => void): () => void {
    if (!window.electronAPI?.serviceChannel.on) {
      return () => {};
    }
    return window.electronAPI.serviceChannel.on('cli-approval-queue-changed', (data) => {
      callback(data as CliChangeRequest[]);
    });
  }
}
