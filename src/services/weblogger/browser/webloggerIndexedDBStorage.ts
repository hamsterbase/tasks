import { LogEntry, LogLevel } from '../common/webloggerService';
import { generateUuid } from 'vscf/base/common/uuid';
import { nanoid } from 'nanoid';

export class WebLoggerIndexedDBStorage {
  private static readonly DB_NAME = 'weblogger';
  private static readonly DB_VERSION = 1;
  private static readonly TAB_ID_KEY = 'weblogger_tab_id';
  private static readonly BATCH_SIZE = 100;
  private static readonly FLUSH_INTERVAL = 1000;

  private readonly instanceId: string;
  private readonly tabId: string;
  private count = 0;
  private readonly dbCache = new Map<string, Promise<IDBDatabase>>();
  private readonly dbInstances = new Map<string, IDBDatabase>();
  private readonly pendingLogs: LogEntry[] = [];
  private flushTimer: number | null = null;
  private isFlushingLogs = false;

  constructor() {
    this.instanceId = nanoid(5);
    this.tabId = this.getOrCreateTabId();
  }

  private getOrCreateTabId(): string {
    let tabId = sessionStorage.getItem(WebLoggerIndexedDBStorage.TAB_ID_KEY);
    if (!tabId) {
      tabId = nanoid(5);
      sessionStorage.setItem(WebLoggerIndexedDBStorage.TAB_ID_KEY, tabId);
    }
    return tabId;
  }

  private getDatabaseName(date: string): string {
    return `${WebLoggerIndexedDBStorage.DB_NAME}-${date}`;
  }

  private getStoreName(): string {
    return 'logs';
  }

  private getTodayDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  private async openDB(date: string): Promise<IDBDatabase> {
    const dbName = this.getDatabaseName(date);

    if (this.dbInstances.has(dbName)) {
      return this.dbInstances.get(dbName)!;
    }

    if (this.dbCache.has(dbName)) {
      return this.dbCache.get(dbName)!;
    }

    const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, WebLoggerIndexedDBStorage.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        this.dbInstances.set(dbName, db);
        this.dbCache.delete(dbName);

        db.addEventListener('close', () => {
          this.dbInstances.delete(dbName);
        });

        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.getStoreName())) {
          const store = db.createObjectStore(this.getStoreName(), { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('level', 'level', { unique: false });
        }
      };
    });

    this.dbCache.set(dbName, dbPromise);
    return dbPromise;
  }

  saveLog(level: LogLevel, message: string): void {
    const now = new Date();
    const dateString = this.getTodayDateString();
    const logEntry: LogEntry = {
      id: generateUuid(),
      tabId: this.tabId,
      instanceId: this.instanceId,
      level,
      message,
      timestamp: now.getTime(),
      date: dateString,
      count: this.count++,
    };

    this.pendingLogs.push(logEntry);
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.flushTimer !== null) {
      return;
    }

    const shouldFlushImmediately = this.pendingLogs.length >= WebLoggerIndexedDBStorage.BATCH_SIZE;

    if (shouldFlushImmediately) {
      this.flushLogs();
    } else {
      this.flushTimer = window.setTimeout(() => {
        this.flushLogs();
      }, WebLoggerIndexedDBStorage.FLUSH_INTERVAL);
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.isFlushingLogs || this.pendingLogs.length === 0) {
      return;
    }

    this.isFlushingLogs = true;

    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    const logsToFlush = this.pendingLogs.splice(0);
    const logsByDate = new Map<string, LogEntry[]>();

    for (const log of logsToFlush) {
      if (!logsByDate.has(log.date)) {
        logsByDate.set(log.date, []);
      }
      logsByDate.get(log.date)!.push(log);
    }

    try {
      await Promise.all(Array.from(logsByDate.entries()).map(([date, logs]) => this.batchSaveLogs(date, logs)));
    } catch {
      this.pendingLogs.unshift(...logsToFlush);
    } finally {
      this.isFlushingLogs = false;

      if (this.pendingLogs.length > 0) {
        this.scheduleFlush();
      }
    }
  }

  private async batchSaveLogs(date: string, logs: LogEntry[]): Promise<void> {
    const db = await this.openDB(date);

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.getStoreName(), 'readwrite');
      const store = transaction.objectStore(this.getStoreName());

      let completed = 0;
      let hasError = false;

      const checkCompletion = () => {
        if (completed === logs.length) {
          if (hasError) {
            reject(new Error('Some logs failed to save'));
          } else {
            resolve();
          }
        }
      };

      for (const log of logs) {
        const request = store.add(log);

        request.onsuccess = () => {
          completed++;
          checkCompletion();
        };

        request.onerror = () => {
          hasError = true;
          completed++;
          checkCompletion();
        };
      }
    });
  }

  async getAllLogs(): Promise<LogEntry[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const allLogs: LogEntry[] = [];
    const dbPromises: Promise<LogEntry[]>[] = [];

    for (let i = 0; i < 8; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      dbPromises.push(this.getLogsForDate(dateString));
    }

    const results = await Promise.allSettled(dbPromises);
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allLogs.push(...result.value);
      }
    });

    return allLogs.sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      return a.count - b.count;
    });
  }

  private async getLogsForDate(date: string): Promise<LogEntry[]> {
    try {
      const db = await this.openDB(date);
      return await new Promise<LogEntry[]>((resolve, reject) => {
        const transaction = db.transaction(this.getStoreName(), 'readonly');
        const store = transaction.objectStore(this.getStoreName());
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  async cleanupOldDatabases(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const databases = await indexedDB.databases();
    const cleanupPromises = databases
      .filter((db) => db.name?.startsWith(WebLoggerIndexedDBStorage.DB_NAME + '-'))
      .map(async (db) => {
        const dateString = db.name!.replace(WebLoggerIndexedDBStorage.DB_NAME + '-', '');
        const dbDate = new Date(dateString);

        if (dbDate < sevenDaysAgo) {
          await this.deleteDatabase(db.name!);
        }
      });

    await Promise.allSettled(cleanupPromises);
  }

  private async deleteDatabase(dbName: string): Promise<void> {
    if (this.dbInstances.has(dbName)) {
      this.dbInstances.get(dbName)!.close();
      this.dbInstances.delete(dbName);
    }

    this.dbCache.delete(dbName);

    return new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }

  async dispose(): Promise<void> {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.pendingLogs.length > 0) {
      await this.flushLogs();
    }

    this.dbInstances.forEach((db) => db.close());
    this.dbInstances.clear();
    this.dbCache.clear();
  }
}
