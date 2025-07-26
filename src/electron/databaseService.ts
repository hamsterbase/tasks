import { IDatabaseMeta, LocalDatabaseMeta } from '@/services/database/common/database';
import * as fs from 'fs/promises';
import { nanoid } from 'nanoid';
import * as path from 'path';

export interface IDatabaseStorage {
  id: string;
}

export class ElectronDatabaseService {
  private readonly basePath: string;
  private readonly fileExt = '.hamsterbase_tasks';

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  /**
   * Ensures a directory exists, creating it only if it doesn't already exist
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // If directory already exists, that's fine
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async listDatabases(): Promise<IDatabaseMeta[]> {
    try {
      await this.ensureDirectoryExists(this.basePath);
      await this.ensureDatabase(LocalDatabaseMeta);

      const entries = await fs.readdir(this.basePath, { withFileTypes: true });
      const databases: IDatabaseMeta[] = [];

      // Read metadata from each database directory
      for (const entry of entries.filter((entry) => entry.isDirectory())) {
        try {
          const metaPath = path.join(this.basePath, entry.name, '_meta.json');
          const metaData = await fs.readFile(metaPath, 'utf8');
          const meta = JSON.parse(metaData);
          databases.push(meta);
        } catch (error) {
          console.error(`Error reading metadata for ${entry.name}:`, error);
        }
      }

      return databases;
    } catch (error) {
      console.error('Error listing databases:', error);
      return [];
    }
  }

  async ensureDatabase(meta: IDatabaseMeta): Promise<void> {
    const dbPath = path.join(this.basePath, `hamster-base-tasks-${meta.id}`);
    await this.ensureDirectoryExists(dbPath);

    // Write metadata file
    const metaPath = path.join(dbPath, '_meta.json');
    await fs.writeFile(metaPath, JSON.stringify(meta), 'utf8');
  }

  async deleteDatabase(databaseId: string): Promise<void> {
    try {
      const dbPath = path.join(this.basePath, `hamster-base-tasks-${databaseId}`);
      await fs.rm(dbPath, { recursive: true, force: true });
    } catch (error) {
      console.error('Error deleting database:', error);
      throw error;
    }
  }

  async getDatabaseMeta(databaseId: string): Promise<IDatabaseMeta> {
    const databases = await this.listDatabases();
    const meta = databases.find((database) => database.id === databaseId);

    if (!meta) {
      throw new Error('Database not found');
    }

    return meta;
  }

  // Storage operations
  private getStoragePath(databaseId: string): string {
    return path.join(this.basePath, `hamster-base-tasks-${databaseId}`);
  }

  private async ensureStorageDir(databaseId: string): Promise<void> {
    const storagePath = this.getStoragePath(databaseId);
    await this.ensureDirectoryExists(storagePath);

    // Ensure database exists
    const databases = await this.listDatabases();
    const meta = databases.find((db) => db.id === databaseId);
    if (!meta) {
      if (databaseId === 'local') {
        await this.ensureDatabase(LocalDatabaseMeta);
      } else {
        throw new Error('Database not found');
      }
    }
  }

  async saveToStorage(databaseId: string, content: string): Promise<string> {
    await this.ensureStorageDir(databaseId);
    const key = nanoid();
    const storagePath = this.getStoragePath(databaseId);
    const filePath = path.join(storagePath, `${key}${this.fileExt}`);

    await fs.writeFile(filePath, content, 'utf8');
    return key;
  }

  async deleteFromStorage(databaseId: string, key: string): Promise<void> {
    const storagePath = this.getStoragePath(databaseId);
    const filePath = path.join(storagePath, `${key}${this.fileExt}`);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async listStorageKeys(databaseId: string): Promise<string[]> {
    try {
      await this.ensureStorageDir(databaseId);
      const storagePath = this.getStoragePath(databaseId);
      const files = await fs.readdir(storagePath);

      return files
        .filter((file) => file.endsWith(this.fileExt) && file !== '_meta.json')
        .map((file) => file.replace(this.fileExt, ''));
    } catch (error) {
      console.error('Error listing storage keys:', error);
      return [];
    }
  }

  async readFromStorage(databaseId: string, key: string): Promise<string> {
    const storagePath = this.getStoragePath(databaseId);
    const filePath = path.join(storagePath, `${key}${this.fileExt}`);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Key not found');
    }
  }
}
