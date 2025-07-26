import { IDatabaseMeta } from '@/services/database/common/database';
import './types';

export interface IElectronDatabaseService {
  listDatabases(): Promise<IDatabaseMeta[]>;
  ensureDatabase(meta: IDatabaseMeta): Promise<void>;
  deleteDatabase(databaseId: string): Promise<void>;
  getDatabaseMeta(databaseId: string): Promise<IDatabaseMeta>;
  saveToStorage(databaseId: string, content: string): Promise<string>;
  deleteFromStorage(databaseId: string, key: string): Promise<void>;
  listStorageKeys(databaseId: string): Promise<string[]>;
  readFromStorage(databaseId: string, key: string): Promise<string>;
}

export class ElectronDatabaseServiceClient implements IElectronDatabaseService {
  private readonly serviceName = 'databaseService';

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

  async listDatabases(): Promise<IDatabaseMeta[]> {
    return this.call('listDatabases', []);
  }

  async ensureDatabase(meta: IDatabaseMeta): Promise<void> {
    return this.call('ensureDatabase', [meta]);
  }

  async deleteDatabase(databaseId: string): Promise<void> {
    return this.call('deleteDatabase', [databaseId]);
  }

  async getDatabaseMeta(databaseId: string): Promise<IDatabaseMeta> {
    return this.call('getDatabaseMeta', [databaseId]);
  }

  async saveToStorage(databaseId: string, content: string): Promise<string> {
    return this.call('saveToStorage', [databaseId, content]);
  }

  async deleteFromStorage(databaseId: string, key: string): Promise<void> {
    return this.call('deleteFromStorage', [databaseId, key]);
  }

  async listStorageKeys(databaseId: string): Promise<string[]> {
    return this.call('listStorageKeys', [databaseId]);
  }

  async readFromStorage(databaseId: string, key: string): Promise<string> {
    return this.call('readFromStorage', [databaseId, key]);
  }
}
