import { Event, Emitter } from 'vscf/base/common/event';
import { createDecorator } from 'vscf/platform/instantiation/common';

export interface IConfigStorage {
  /**
   * Initialize the storage and load any persisted data
   */
  init(): Promise<Record<string, string>>;

  /**
   * Save a key-value pair to storage
   */
  save(key: string, value: string): Promise<void>;
}

export type ConfigKey<T> = {
  key: string;
  default: T;
  check: (value: T) => boolean;
};

export type ConfigType = string | number | boolean;

export interface ConfigChangeEvent {
  key: string;
}

export interface IConfigService {
  readonly _serviceBrand: undefined;
  onConfigChange: Event<ConfigChangeEvent>;
  init(): Promise<void>;
  get<T>(config: ConfigKey<T>): T;
  save<T>(key: ConfigKey<T>, value: T): Promise<void>;
}

export class WorkbenchConfig implements IConfigService {
  readonly _serviceBrand: undefined;
  private readonly _onConfigChange = new Emitter<ConfigChangeEvent>();
  readonly onConfigChange: Event<ConfigChangeEvent> = this._onConfigChange.event;

  private configStore: Record<string, string> = {};

  constructor(private readonly storage: IConfigStorage) {}

  async init(): Promise<void> {
    this.configStore = JSON.parse(JSON.stringify(await this.storage.init()));
  }

  get<T = ConfigType>(config: ConfigKey<T>): T {
    const storedValue = this.configStore[config.key];
    if (!storedValue) {
      return config.default as T;
    }

    try {
      const parsedValue = JSON.parse(storedValue);
      if (!config.check(parsedValue)) {
        return config.default as T;
      }
      return parsedValue as T;
    } catch (error) {
      console.error(`Error parsing config value for key ${config.key}:`, error);
      return config.default as T;
    }
  }

  async save<T = ConfigType>(config: ConfigKey<T>, value: T): Promise<void> {
    if (!config.check(value)) {
      throw new Error(`Invalid value for config ${config.key}.`);
    }
    try {
      const stringValue = JSON.stringify(value);
      this.configStore[config.key] = stringValue;
      await this.storage.save(config.key, stringValue);
      this._onConfigChange.fire({ key: config.key });
    } catch (error) {
      console.error(`Error saving config value for key ${config.key}:`, error);
      throw new Error(`Failed to save config value for ${config.key}`);
    }
  }
}

export const IConfigService = createDecorator<IConfigService>('wwewe');
