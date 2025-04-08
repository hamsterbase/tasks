import { localize } from '@/nls';
import { generateUuid } from 'vscf/base/common/uuid';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { IDatabaseMeta, IDatabaseStorage } from '../common/database';

export class FileStorage implements IDatabaseStorage {
  private readonly baseDir: string;
  private readonly meta: IDatabaseMeta;
  private readonly directory: Directory;
  private readonly fileExt: string = '.hamsterbase_tasks';

  constructor(baseDir: string, meta: IDatabaseMeta, directory: Directory) {
    this.baseDir = baseDir;
    this.meta = meta;
    this.directory = directory;
  }

  public get id(): string {
    return this.meta.id;
  }

  private async ensureBaseDir(): Promise<void> {
    try {
      // First check if the directory exists
      try {
        await Filesystem.readdir({
          path: this.baseDir,
          directory: this.directory,
        });
        // Directory exists, check if metadata file exists
        try {
          await Filesystem.readFile({
            path: `${this.baseDir}/_meta.json`,
            directory: this.directory,
            encoding: Encoding.UTF8,
          });
          // Metadata file exists, nothing to do
        } catch {
          // Metadata file doesn't exist, create it
          await Filesystem.writeFile({
            path: `${this.baseDir}/_meta.json`,
            data: JSON.stringify(this.meta),
            directory: this.directory,
            encoding: Encoding.UTF8,
          });
        }
      } catch {
        // Directory doesn't exist, create it and the metadata file
        await Filesystem.mkdir({
          path: this.baseDir,
          directory: this.directory,
          recursive: true,
        });

        // Write metadata file
        await Filesystem.writeFile({
          path: `${this.baseDir}/_meta.json`,
          data: JSON.stringify(this.meta),
          directory: this.directory,
          encoding: Encoding.UTF8,
        });
      }
    } catch (error) {
      if ((error as Error).message.includes('Directory exists')) {
        // do nothing
      } else {
        console.error(localize('errorEnsuringBaseDir', 'Error ensuring base directory:'), error);
      }
    }
  }

  async save(content: string): Promise<string> {
    await this.ensureBaseDir();
    const key = generateUuid();

    await Filesystem.writeFile({
      path: `${this.baseDir}/${key}${this.fileExt}`,
      data: content,
      directory: this.directory,
      encoding: Encoding.UTF8,
    });

    return key;
  }

  async delete(key: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: `${this.baseDir}/${key}${this.fileExt}`,
        directory: this.directory,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async list(): Promise<string[]> {
    try {
      await this.ensureBaseDir();
      const result = await Filesystem.readdir({
        path: this.baseDir,
        directory: this.directory,
      });

      return result.files
        .filter((file) => file.name.endsWith(this.fileExt) && file.name !== '_meta.json')
        .map((file) => file.name.replace(this.fileExt, ''));
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  async read(key: string): Promise<string> {
    try {
      const result = await Filesystem.readFile({
        path: `${this.baseDir}/${key}${this.fileExt}`,
        directory: this.directory,
        encoding: Encoding.UTF8,
      });
      return result.data as string;
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error(localize('keyNotFound', 'Key not found'));
    }
  }
}
