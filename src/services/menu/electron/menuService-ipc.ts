export interface IElectronMenuService {
  setApplicationMenu(template: Electron.MenuItemConstructorOptions[]): Promise<void>;
}

export class ElectronMenuServiceClient implements IElectronMenuService {
  private readonly serviceName = 'menuService';

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

  async setApplicationMenu(template: Electron.MenuItemConstructorOptions[]): Promise<void> {
    return this.call('setApplicationMenu', [template]);
  }
}
