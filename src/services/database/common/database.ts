import { localize } from '@/nls';
import { createDecorator } from 'vscf/platform/instantiation/common';

export interface IDatabaseMeta {
  account: string;
  id: string;
  name: string;
  salt: string;
  accessKey: string;
  encryptionKey: string;
}
export const LocalDatabaseMeta: IDatabaseMeta = {
  account: '',
  id: 'local',
  name: localize('localDatabaseName', '本地数据库'),
  salt: '',
  accessKey: '',
  encryptionKey: '',
};

export interface IDatabaseStorage {
  id: string;
  save(content: string): Promise<string>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
  read(key: string): Promise<string>;
}

export interface IDatabaseService {
  readonly _serviceBrand: undefined;

  listDatabases(): Promise<IDatabaseMeta[]>;

  getDatabaseMeta(databaseId: string): Promise<IDatabaseMeta>;

  deleteDatabase(databaseId: string): Promise<void>;

  ensureDatabase(meta: IDatabaseMeta): Promise<void>;

  getDatabaseStorage(databaseId: string): Promise<IDatabaseStorage>;
}

export const IDatabaseService = createDecorator<IDatabaseService>('IDatabaseService');
