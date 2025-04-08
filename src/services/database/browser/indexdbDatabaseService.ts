import { IndexedDBStorage } from '@/services/todo/browser/IndexedDBStorage';
import { IDatabaseMeta, IDatabaseService, IDatabaseStorage, LocalDatabaseMeta } from '../common/database';

export class IndexdbDatabaseService implements IDatabaseService {
  public readonly _serviceBrand: undefined;

  async listDatabases(): Promise<IDatabaseMeta[]> {
    await this.ensureDatabase(LocalDatabaseMeta);
    const localDatabases = await IndexedDBStorage.listStores<IDatabaseMeta>('hamster-base-tasks');
    return localDatabases.map((database) => database.meta).filter((database) => database !== null);
  }

  async ensureDatabase(meta: IDatabaseMeta): Promise<void> {
    const db = new IndexedDBStorage(`hamster-base-tasks`, `hamster-base-tasks-${meta.id}`, meta);
    await db.list();
  }

  async deleteDatabase(databaseId: string): Promise<void> {
    await IndexedDBStorage.deleteStore(`hamster-base-tasks`, `hamster-base-tasks-${databaseId}`);
  }

  async getDatabaseStorage(databaseId: string): Promise<IDatabaseStorage> {
    if (databaseId === 'local') {
      return new IndexedDBStorage(`hamster-base-tasks`, `hamster-base-tasks-local`, LocalDatabaseMeta);
    }
    const database = await this.listDatabases();
    const meta = database.find((database) => database.id === databaseId);
    if (!meta) {
      throw new Error('Database not found');
    }
    return new IndexedDBStorage(`hamster-base-tasks`, `hamster-base-tasks-${databaseId}`, meta);
  }

  async getDatabaseMeta(databaseId: string): Promise<IDatabaseMeta> {
    const database = await this.listDatabases();
    const meta = database.find((database) => database.id === databaseId);
    if (!meta) {
      throw new Error('Database not found');
    }
    return meta;
  }
}
