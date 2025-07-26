import { ElectronDatabaseServiceClient } from '../../../electron/databaseService-ipc';
import { IDatabaseMeta, IDatabaseService, IDatabaseStorage } from '../common/database';
import { ElectronFileStorage } from './electronFileStorage';

export class ElectronFsDatabaseService implements IDatabaseService {
  public readonly _serviceBrand: undefined;
  private readonly client = new ElectronDatabaseServiceClient();

  async listDatabases(): Promise<IDatabaseMeta[]> {
    return this.client.listDatabases();
  }

  async ensureDatabase(meta: IDatabaseMeta): Promise<void> {
    return this.client.ensureDatabase(meta);
  }

  async deleteDatabase(databaseId: string): Promise<void> {
    return this.client.deleteDatabase(databaseId);
  }

  async getDatabaseStorage(databaseId: string): Promise<IDatabaseStorage> {
    const meta = await this.client.getDatabaseMeta(databaseId);
    return new ElectronFileStorage(databaseId, meta, this.client);
  }

  async getDatabaseMeta(databaseId: string): Promise<IDatabaseMeta> {
    return this.client.getDatabaseMeta(databaseId);
  }
}
