import { localize } from '@/nls';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { IDatabaseMeta, IDatabaseService, IDatabaseStorage, LocalDatabaseMeta } from '../common/database';
import { FileStorage } from './fileStorage';

export class FsDatabaseService implements IDatabaseService {
  private directory: Directory;
  public readonly _serviceBrand: undefined;
  private readonly basePath = 'hamster-base-tasks';

  constructor(directory: Directory) {
    this.directory = directory;
  }

  /**
   * Ensures a directory exists, creating it only if it doesn't already exist
   * @param path The path to ensure exists
   * @returns A promise that resolves when the directory exists
   */
  private async ensureDirectoryExists(path: string): Promise<void> {
    try {
      // First check if the directory exists
      await Filesystem.readdir({
        path,
        directory: this.directory,
      });
      // If we get here, the directory exists
    } catch {
      // Directory doesn't exist, create it
      try {
        await Filesystem.mkdir({
          path,
          directory: this.directory,
          recursive: true,
        });
      } catch (mkdirError) {
        console.error(localize('errorCreatingDirectory', 'Error creating directory:'), mkdirError);
        throw mkdirError;
      }
    }
  }

  async listDatabases(): Promise<IDatabaseMeta[]> {
    try {
      await this.ensureDirectoryExists(this.basePath);
      await this.ensureDatabase(LocalDatabaseMeta);

      const result = await Filesystem.readdir({
        path: this.basePath,
        directory: this.directory,
      });

      const databases: IDatabaseMeta[] = [];

      // Read metadata from each database directory
      for (const dir of result.files.filter((file) => file.type === 'directory')) {
        try {
          const metaFile = await Filesystem.readFile({
            path: `${this.basePath}/${dir.name}/_meta.json`,
            directory: this.directory,
            encoding: Encoding.UTF8,
          });
          const meta = JSON.parse(metaFile.data as string);
          databases.push(meta);
        } catch (error) {
          console.error(localize('errorReadingMetadata', 'Error reading metadata for {0}:', dir.name), error);
        }
      }

      return databases;
    } catch (error) {
      console.error(localize('errorListingDatabases', 'Error listing databases:'), error);
      return [];
    }
  }

  async ensureDatabase(meta: IDatabaseMeta): Promise<void> {
    const dbPath = `${this.basePath}/hamster-base-tasks-${meta.id}`;
    await this.ensureDirectoryExists(dbPath);

    // Write metadata file
    await Filesystem.writeFile({
      path: `${dbPath}/_meta.json`,
      data: JSON.stringify(meta),
      directory: this.directory,
      encoding: Encoding.UTF8,
    });
  }

  async deleteDatabase(databaseId: string): Promise<void> {
    try {
      await Filesystem.rmdir({
        path: `${this.basePath}/hamster-base-tasks-${databaseId}`,
        directory: this.directory,
        recursive: true,
      });
    } catch (error) {
      console.error(localize('errorDeletingDatabase', 'Error deleting database:'), error);
      throw error;
    }
  }

  async getDatabaseStorage(databaseId: string): Promise<IDatabaseStorage> {
    if (databaseId === 'local') {
      return new FileStorage(`${this.basePath}/hamster-base-tasks-local`, LocalDatabaseMeta, this.directory);
    }

    const databases = await this.listDatabases();
    const meta = databases.find((database) => database.id === databaseId);
    if (!meta) {
      return new FileStorage(`${this.basePath}/hamster-base-tasks-local`, LocalDatabaseMeta, this.directory);
    }
    return new FileStorage(`${this.basePath}/hamster-base-tasks-${databaseId}`, meta, this.directory);
  }

  async getDatabaseMeta(databaseId: string): Promise<IDatabaseMeta> {
    const databases = await this.listDatabases();
    const meta = databases.find((database) => database.id === databaseId);

    if (!meta) {
      throw new Error(localize('databaseNotFound', 'Database not found'));
    }

    return meta;
  }
}
