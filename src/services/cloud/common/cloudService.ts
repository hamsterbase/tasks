import { generatePasswordKeys } from '@/core/crypto/generatePasswordKeys';
import { sha256 } from '@/core/crypto/sha256';
import { localize } from '@/nls';
import { HttpError } from '@/packages/cloud/error';
import { HbCloudSDK } from '@/packages/cloud/main';
import { chinaServerConfigKey } from '@/services/config/config';
import { IConfigService } from '@/services/config/configService.ts';
import { IDatabaseService } from '@/services/database/common/database';
import { ITodoService } from '@/services/todo/common/todoService';
import { Emitter, Event } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/base/common/lifecycle';
import { createDecorator } from 'vscf/platform/instantiation/common';
import { syncDatabaseLogic } from './syncLogic';

export type NotLoginConfig = {
  type: 'not_login';
};

export type LoginConfig = {
  type: 'login';
  account: string;
  session: string;
};

export type CloudDatabaseConfig = {
  type: 'cloud';
  account: string;
  database_id: string;
  database_name: string;
  database_salt: string;
  database_access_key: string;
  database_encryption_key: string;
  stop_sync?: boolean;
};

export type DatabaseConfig =
  | {
      type: 'local';
      database_id: string;
    }
  | CloudDatabaseConfig;

export type AccountConfig = NotLoginConfig | LoginConfig;

export type AccountOfflineReason = 'other' | 'database_deleted' | 'account_logged_out' | 'other_account';

interface AccountInfo {
  account: string;
  expiresAt: number;
  accountId: string;
}

export type DeviceDatabaseItem =
  | {
      type: 'local';
      databaseId: 'local';
      databaseName: string;
    }
  | {
      type: 'cloud';
      // 数据库所在账户
      account: string;
      // 数据库ID
      databaseId: string;
      // 数据库名称
      databaseName: string;
      // 数据库最后修改时间
      lastModified: number;
      // 数据库使用量
      usage: number;
      // 数据库盐值
      database_salt: string;
      // 数据库是否存在
      exists: boolean;
    }
  | {
      type: 'offline';
      reason: AccountOfflineReason;
      // 数据库所在账户
      account: string;
      // 数据库ID
      databaseId: string;
      // 数据库名称
      databaseName: string;
    };

export function formatReason(reason: AccountOfflineReason): string {
  switch (reason) {
    case 'account_logged_out': {
      return localize('database.account_logged_out', 'Account logged out');
    }
    case 'database_deleted': {
      return localize('database.database_deleted', 'Database was deleted in cloud');
    }
    case 'other_account': {
      return localize('database.other_account', 'This database does not belong to this account');
    }
    case 'other': {
      return localize('database.other_reason', 'Load cloud database error');
    }
  }
}

const NotLoginError = new Error(localize('not_login', 'Account is logged out'));

export interface ICloudService extends IDisposable {
  readonly _serviceBrand: undefined;
  config: AccountConfig;
  databaseConfig: string;
  login(account: string, password: string): Promise<void>;
  register(account: string, password: string): Promise<void>;
  deleteDatabase(databaseId: string, password: string, database_salt: string): Promise<void>;
  deleteLocalDatabase(databaseId: string): Promise<void>;
  logout(): Promise<void>;
  sync(): Promise<void>;
  syncImmediately(): Promise<void>;
  deleteAccount(): Promise<void>;
  createDatabase(databaseName: string, databasePassword: string): Promise<void>;
  loginDatabase(
    databaseId: string,
    databaseSalt: string,
    databasePassword: string,
    databaseName: string
  ): Promise<void>;

  switchToLocalDatabase(databaseId: string): Promise<void>;

  userInfo(): Promise<AccountInfo | null>;

  listDatabases(): Promise<DeviceDatabaseItem[]>;

  onSessionChange: Event<void>;

  init(): Promise<void>;

  checkAndInsertPurchaseHistory(): Promise<void>;
}

export class CloudService implements ICloudService {
  public readonly _serviceBrand: undefined;
  public config: AccountConfig;
  public databaseConfig: string = 'local';

  private readonly _onSessionChange = new Emitter<void>();
  public onSessionChange = this._onSessionChange.event;

  private _sdk: HbCloudSDK;

  private syncTask: NodeJS.Timeout | null = null;
  private syncRequest: Promise<void> | null = null;
  private lastSyncTime: number | null = null;
  private needSync = false;
  private syncWaitTime = 8000;

  private notSyncDatabases: Set<string> = new Set(['local']);

  constructor(
    @ITodoService private readonly todoService: ITodoService,
    @IDatabaseService private readonly databaseService: IDatabaseService,
    @IConfigService private readonly configService: IConfigService
  ) {
    this.config = localStorage.getItem('account')
      ? JSON.parse(localStorage.getItem('account')!)
      : { type: 'not_login' };

    this._sdk = this.configSdk();
    this.configService.onConfigChange((event) => {
      if (event.key === chinaServerConfigKey().key) {
        this._sdk = this.configSdk();
      }
    });
    todoService.onStateChange(() => {
      this.needSync = true;
    });
    this.setInterval();
  }

  async checkAndInsertPurchaseHistory() {
    if (this.config.type !== 'login') {
      return;
    }
    const sdk = this._sdk.clone();
    sdk.setToken(this.config.session);
    await sdk.account.checkAndInsertPurchaseHistory();
  }

  private configSdk() {
    const chinaServer = this.configService.get(chinaServerConfigKey());
    if (chinaServer) {
      return new HbCloudSDK({
        endpoint: 'https://cloud.kdtech.site',
        requestLib: HbCloudSDK.fetchToRequestLib(window.fetch),
      });
    } else {
      return new HbCloudSDK({
        endpoint: 'https://cloud.hamsterbase.com',
        requestLib: HbCloudSDK.fetchToRequestLib(window.fetch),
      });
    }
  }

  async sync() {
    this.needSync = true;
  }

  async init(): Promise<void> {
    this.databaseConfig = localStorage.getItem('database_id') ? localStorage.getItem('database_id')! : 'local';
    await this.updateDatabaseConfig(this.databaseConfig);
  }

  private setInterval() {
    this.syncTask = setInterval(() => {
      if (!this.needSync || this.syncRequest) {
        return;
      }
      if (this.lastSyncTime && Date.now() - this.lastSyncTime < this.syncWaitTime) {
        return;
      }
      this.syncRequest = this.doSync()
        .then(() => {
          this.needSync = false;
        })
        .finally(() => {
          this.syncRequest = null;
          this.lastSyncTime = Date.now();
        });
    }, 1000);
  }

  dispose() {
    if (this.syncTask) {
      clearInterval(this.syncTask);
    }
  }

  async syncImmediately() {
    return this.doSync();
  }

  // The actual sync implementation
  private async doSync() {
    if (this.config.type !== 'login') {
      return;
    }
    const currentDatabase = this.databaseConfig;
    const database = await this.databaseService.getDatabaseMeta(currentDatabase);
    if (database.account !== this.config.account || this.notSyncDatabases.has(currentDatabase)) {
      return;
    }
    try {
      const sdk = this._sdk.clone();
      sdk.setToken(this.config.session);
      await syncDatabaseLogic(sdk, this.todoService, database);
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.code === 'E02C001') {
          this.notSyncDatabases.add(currentDatabase);
        }
      }
    }
  }

  async listDatabases(): Promise<DeviceDatabaseItem[]> {
    const localDatabases = await this.databaseService.listDatabases();
    let cloudDatabase: DeviceDatabaseItem[] = [];
    let reason: AccountOfflineReason = 'database_deleted';
    const config = this.config;
    if (config.type !== 'not_login') {
      const sdk = this._sdk.clone();
      sdk.setToken(config.session);
      try {
        cloudDatabase = (await sdk.database.listDatabases('tasks')).map(
          (database): DeviceDatabaseItem => ({
            type: 'cloud',
            account: config.account,
            databaseId: database.database_id,
            databaseName: database.database_name,
            lastModified: database.last_modified,
            usage: database.usage,
            database_salt: database.database_salt,
            exists: localDatabases.some((localDatabase) => localDatabase.id === database.database_id),
          })
        );
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (error && (error as any).code === 'E01C003') {
          this.updateUserConfig({ type: 'not_login' });
          reason = 'account_logged_out';
        } else {
          reason = 'other';
        }
      }
    } else {
      reason = 'account_logged_out';
    }
    const local: DeviceDatabaseItem[] = localDatabases
      .map((database): DeviceDatabaseItem | null => {
        if (database.id === 'local') {
          return {
            type: 'local',
            databaseId: database.id,
            databaseName: localize('settings.local.database', 'Local Database'),
          };
        }
        if (cloudDatabase.find((cloudDatabase) => cloudDatabase.databaseId === database.id)) {
          return null;
        }
        if (config.type === 'login' && config.account !== database.account) {
          return {
            type: 'offline',
            reason: 'other_account',
            databaseId: database.id,
            account: database.account,
            databaseName: database.name,
          };
        }
        return {
          type: 'offline',
          reason,
          databaseId: database.id,
          account: database.account,
          databaseName: database.name,
        };
      })
      .filter((database) => database !== null);
    const result = local.concat(cloudDatabase);
    return result;
  }

  async switchToLocalDatabase(databaseId: string) {
    const localDatabases = await this.databaseService.listDatabases();
    const database = localDatabases.find((database) => database.id === databaseId);
    if (!database) {
      throw new Error(localize('database_not_found', 'Database not found'));
    }
    await this.updateDatabaseConfig(databaseId);
  }

  async register(account: string, password: string): Promise<void> {
    const res = await this._sdk.account.register({
      account,
      password: sha256(password),
    });
    this.updateUserConfig({ type: 'login', account, session: res.session });
  }

  async loginDatabase(
    databaseId: string,
    database_salt: string,
    password: string,
    databaseName: string
  ): Promise<void> {
    if (this.config.type === 'not_login') {
      throw NotLoginError;
    }
    const sdk = this._sdk.clone();
    sdk.setToken(this.config.session);
    const { accessKey, encryptionKey } = generatePasswordKeys(password, database_salt);
    // 检查是否有效
    await sdk.database.getDatabaseChanges({
      database_id: databaseId,
      database_access_key: accessKey,
      database_salt,
      from_version: null,
    });
    await this.databaseService.ensureDatabase({
      account: this.config.account,
      id: databaseId,
      name: databaseName,
      salt: database_salt,
      accessKey: accessKey,
      encryptionKey: encryptionKey,
    });
    await this.updateDatabaseConfig(databaseId);
  }

  async logout() {
    if (this.config.type === 'not_login') {
      return;
    }
    const sdk = this._sdk.clone();
    sdk.setToken(this.config.session);
    await sdk.account.logout();
    this.updateUserConfig({ type: 'not_login' });
  }

  async deleteLocalDatabase(databaseId: string) {
    await this.databaseService.deleteDatabase(databaseId);
    if (this.databaseConfig === databaseId) {
      await this.updateDatabaseConfig('local');
    }
  }

  async createDatabase(databaseName: string, databasePassword: string): Promise<void> {
    if (this.config.type === 'not_login') {
      throw NotLoginError;
    }
    const { salt, accessKey, encryptionKey } = generatePasswordKeys(databasePassword);
    const sdk = this._sdk.clone();
    sdk.setToken(this.config.session);
    const database_id = await sdk.database.createDatabase({
      application_name: 'tasks',
      database_name: databaseName,
      database_salt: salt,
      database_access_key: accessKey,
    });
    await this.databaseService.ensureDatabase({
      account: this.config.account,
      id: database_id,
      name: databaseName,
      salt: salt,
      accessKey: accessKey,
      encryptionKey: encryptionKey,
    });
    await this.updateDatabaseConfig(database_id);
  }

  async login(account: string, password: string): Promise<void> {
    const res = await this._sdk.account.login({
      account,
      password: sha256(password),
    });
    this.updateUserConfig({ type: 'login', account, session: res.session });
  }

  async deleteDatabase(databaseId: string, password: string, database_salt: string): Promise<void> {
    if (this.config.type !== 'login') {
      throw NotLoginError;
    }
    const sdk = this._sdk.clone();
    const { accessKey } = generatePasswordKeys(password, database_salt);
    sdk.setToken(this.config.session);
    await sdk.database.deleteDatabase({
      database_id: databaseId,
      database_access_key: accessKey,
      database_salt,
    });
    await this.deleteLocalDatabase(databaseId);
  }

  async deleteAccount(): Promise<void> {
    if (this.config.type === 'not_login') {
      throw NotLoginError;
    }
    const sdk = this._sdk.clone();
    sdk.setToken(this.config.session);
    await sdk.account.delete();
    this.updateUserConfig({ type: 'not_login' });
  }

  private async updateDatabaseConfig(config: string) {
    this.databaseConfig = config;
    localStorage.setItem('database_id', this.databaseConfig);
    this._onSessionChange.fire();
    try {
      const storage = await this.databaseService.getDatabaseStorage(config);
      await this.todoService.initStorage(storage);
    } catch {
      this.databaseConfig = 'local';
      localStorage.setItem('database_id', this.databaseConfig);
      this._onSessionChange.fire();
      await this.todoService.initStorage(await this.databaseService.getDatabaseStorage('local'));
    }
  }

  private async updateUserConfig(config: AccountConfig) {
    this.config = config;
    localStorage.setItem('account', JSON.stringify(this.config));
    this._onSessionChange.fire();
  }

  async userInfo(): Promise<AccountInfo | null> {
    const sdk = this._sdk.clone();
    if (this.config.type !== 'login') {
      return null;
    }
    sdk.setToken(this.config.session);
    const res = await sdk.account.getAccount();
    return res;
  }
}

export const ICloudService = createDecorator<ICloudService>('cloudService');
