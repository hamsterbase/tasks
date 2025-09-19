import { TaskModel } from '@/core/model';
import { thirdpartySyncServersConfigKey } from '@/services/config/config';
import { IConfigService } from '@/services/config/configService';
import { IDatabaseStorage } from '@/services/database/common/database';
import { WorkbenchTodoService } from '@/services/todo/browser/workbenchTodoService';
import { ITodoService } from '@/services/todo/common/todoService';
import { decodeBase64, encodeBase64, VSBuffer } from 'vscf/base/common/buffer';
import { Emitter } from 'vscf/base/common/event';
import { generateUuid } from 'vscf/base/common/uuid';
import { SelfhostedServerStorage } from './SelfhostedServerStorage';
import { IThirdpartySyncServerConfig, IThirdpartySyncService } from './thirdpartySyncService';

export class WorkbenchThirdpartySyncService implements IThirdpartySyncService {
  readonly _serviceBrand: undefined;

  private onStateChangeEmitter = new Emitter<void>();
  onStateChange = this.onStateChangeEmitter.event;

  constructor(
    @IConfigService private configService: IConfigService,
    @ITodoService private todoService: WorkbenchTodoService
  ) {
    todoService.onStateChange(() => {
      this.onStateChangeEmitter.fire();
    });
  }

  get enabled(): boolean {
    return this.todoService.storageId === 'local';
  }

  get showSyncIcon(): boolean {
    return this.enabled && this.hasServer;
  }

  get hasServer(): boolean {
    return this.storage !== null;
  }

  get config(): IThirdpartySyncServerConfig | null {
    return this.configService.get(thirdpartySyncServersConfigKey());
  }

  private _syncing: boolean = false;

  public get syncing(): boolean {
    return this._syncing;
  }

  private storage: IDatabaseStorage | null = null;

  async addServer(config: Omit<IThirdpartySyncServerConfig, 'id'>): Promise<string> {
    const serverId = generateUuid();
    const newServer: IThirdpartySyncServerConfig = {
      ...config,
      id: serverId,
    };

    const storage = this.initServer(newServer);
    if (!storage) {
      throw new Error(`Failed to initialize storage for server: ${config.type}`);
    }
    await storage.list();
    this.configService.save(thirdpartySyncServersConfigKey(), newServer);
    this.storage = storage;
    this.onStateChangeEmitter.fire();
    return serverId;
  }

  async deleteServer(): Promise<void> {
    this.configService.save(thirdpartySyncServersConfigKey(), null);
    this.onStateChangeEmitter.fire();
    this.storage = null;
  }

  async sync(): Promise<void> {
    const storage = this.storage;
    if (!storage) {
      throw new Error('No storage available for syncing');
    }
    this._syncing = true;
    this.onStateChangeEmitter.fire();
    try {
      const taskModel = new TaskModel();
      const patch = this.todoService.exportPatch({}, this.todoService.storageId);
      taskModel.import([patch]);
      const previousKeys = await storage.list();
      if (previousKeys.length > 0) {
        const data = (await Promise.all(previousKeys.map((p) => storage.read(p)))).filter((item) => item);
        await taskModel.import(data.map((item) => decodeBase64(item).buffer));
        const newModel = await storage.save(encodeBase64(VSBuffer.wrap(taskModel.export())));
        for (const p of previousKeys) {
          if (newModel === p) continue;
          await storage.delete(p);
        }
      } else {
        await storage.save(encodeBase64(VSBuffer.wrap(taskModel.export())));
      }
      this.todoService.import([taskModel.export()], 'local');
    } finally {
      this._syncing = false;
      this.onStateChangeEmitter.fire();
    }
  }

  private initServer(config: IThirdpartySyncServerConfig | null): IDatabaseStorage | null {
    if (!config) {
      return null;
    }
    switch (config.type) {
      case 'selfhosted':
        return new SelfhostedServerStorage(config.id, config.entrypoint, config.authToken, config.folder);
      default: {
        return null;
      }
    }
  }

  async init() {
    this.storage = this.initServer(this.configService.get(thirdpartySyncServersConfigKey()));
    this.onStateChangeEmitter.fire();
  }
}
