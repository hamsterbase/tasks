import { ElectronDatabaseServiceClient } from '../../../electron/databaseService-ipc';
import { IDatabaseMeta, IDatabaseStorage } from '../common/database';

export class ElectronFileStorage implements IDatabaseStorage {
  private readonly databaseId: string;
  private readonly meta: IDatabaseMeta;
  private readonly client: ElectronDatabaseServiceClient;

  constructor(databaseId: string, meta: IDatabaseMeta, client: ElectronDatabaseServiceClient) {
    this.databaseId = databaseId;
    this.meta = meta;
    this.client = client;
  }

  public get id(): string {
    return this.meta.id;
  }

  async save(content: string): Promise<string> {
    return this.client.saveToStorage(this.databaseId, content);
  }

  async delete(key: string): Promise<void> {
    return this.client.deleteFromStorage(this.databaseId, key);
  }

  async list(): Promise<string[]> {
    return this.client.listStorageKeys(this.databaseId);
  }

  async read(key: string): Promise<string> {
    return this.client.readFromStorage(this.databaseId, key);
  }
}
