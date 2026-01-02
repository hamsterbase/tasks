export interface IElectronDockBadgeService {
  setBadge(count: number): Promise<void>;
}

export class ElectronDockBadgeServiceClient implements IElectronDockBadgeService {
  private readonly serviceName = 'dockBadgeService';

  private async call<T>(method: string, args: unknown[]): Promise<T> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.serviceChannel.call({
      serviceName: this.serviceName,
      method,
      args,
    }) as Promise<T>;
  }

  async setBadge(count: number): Promise<void> {
    return this.call('setBadge', [count]);
  }
}
