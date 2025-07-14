import { IWebLoggerService, LogLevel, LogEntry } from '../common/webloggerService';
import { WebLoggerIndexedDBStorage } from './webloggerIndexedDBStorage';

export class WorkbenchWebLoggerService implements IWebLoggerService {
  readonly _serviceBrand: undefined;
  private storage: WebLoggerIndexedDBStorage;
  private cleanupInterval: number | null = null;

  constructor() {
    this.storage = new WebLoggerIndexedDBStorage();
    this.setupCleanupInterval();
  }

  private setupCleanupInterval(): void {
    const twentyFourHours = 60 * 60 * 1000;
    this.cleanupInterval = window.setInterval(() => {
      this.storage.cleanupOldDatabases().catch(console.error);
    }, twentyFourHours);

    this.storage.cleanupOldDatabases().catch(console.error);
  }

  log(message: string): void {
    this.storage.saveLog(LogLevel.LOG, message);
  }

  debug(message: string): void {
    this.storage.saveLog(LogLevel.DEBUG, message);
  }

  error(message: string): void {
    this.storage.saveLog(LogLevel.ERROR, message);
  }

  async exportAll(): Promise<LogEntry[]> {
    return await this.storage.getAllLogs();
  }

  async dispose(): Promise<void> {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    await this.storage.dispose();
  }
}
