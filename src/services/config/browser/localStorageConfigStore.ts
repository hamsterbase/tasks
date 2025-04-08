import { IConfigStorage } from '../configService.ts';

export class LocalStorageConfigStore implements IConfigStorage {
  constructor() {}

  async init(): Promise<Record<string, string>> {
    const config = localStorage.getItem('todo_config');
    return config ? JSON.parse(config) : {};
  }

  private initSync() {
    const config = localStorage.getItem('todo_config');
    return config ? JSON.parse(config) : {};
  }

  async save(key: string, value: string): Promise<void> {
    const config = this.initSync();
    config[key] = value;
    localStorage.setItem('todo_config', JSON.stringify(config));
  }
}
