import { localize } from '@/nls';
import { IDatabaseStorage } from '@/services/database/common/database';
import { generateUuid } from 'vscf/base/common/uuid';

export class IndexedDBStorage<T extends { id: string }> implements IDatabaseStorage {
  public get id() {
    return this.meta.id;
  }

  static async deleteStore(dbName: string, storeName: string) {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.close();
          resolve();
          return;
        }

        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          resolve();
        };
        clearRequest.onerror = () => reject(clearRequest.error);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (db.objectStoreNames.contains(storeName)) {
          db.deleteObjectStore(storeName);
        }
      };
    });
  }

  static async listStores<T>(dbName: string): Promise<{ storeName: string; meta: T }[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        const db = request.result;
        const storeNames = Array.from(db.objectStoreNames);
        const result: { storeName: string; meta: T }[] = [];
        // For each store, try to retrieve its metadata
        for (const storeName of storeNames) {
          try {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const metaRequest = store.get('_meta');
            await new Promise<void>((resolveStore, rejectStore) => {
              metaRequest.onsuccess = () => {
                let meta = null;
                if (metaRequest.result && metaRequest.result.content) {
                  try {
                    meta = JSON.parse(metaRequest.result.content);
                  } catch (err) {
                    rejectStore(err);
                  }
                }
                if (meta) {
                  result.push({ storeName, meta });
                }
                resolveStore();
              };
              metaRequest.onerror = () => {
                rejectStore(metaRequest.error);
              };
            });
          } catch (error) {
            reject(error);
          }
        }

        db.close();
        resolve(result);
      };
    });
  }

  private dbName: string;
  private storeName: string;
  private meta: T;

  constructor(dbName: string, storeName: string, meta: T) {
    if (!dbName || !storeName) {
      throw new Error(localize('indexedDBStorageInvalidParams', 'dbName and storeName are required'));
    }
    this.dbName = dbName;
    this.storeName = storeName;
    this.meta = meta;
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.close();
          // Only upgrade if store doesn't exist
          const upgradeRequest = indexedDB.open(this.dbName, db.version + 1);
          upgradeRequest.onupgradeneeded = (event) => {
            const upgradeDb = (event.target as IDBOpenDBRequest).result;
            upgradeDb.createObjectStore(this.storeName, { keyPath: 'key' });
          };
          upgradeRequest.onerror = () => reject(upgradeRequest.error);
          upgradeRequest.onsuccess = async () => {
            const newDb = upgradeRequest.result;
            // Write metadata after creating store
            try {
              await this.writeMetadata(newDb);
              resolve(newDb);
            } catch (error) {
              reject(error);
            }
          };
        } else {
          // Check if metadata exists, if not write it
          try {
            await this.ensureMetadata(db);
            resolve(db);
          } catch (error) {
            reject(error);
          }
        }
      };
    });
  }

  private async writeMetadata(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ key: '_meta', content: JSON.stringify(this.meta) });
      request.onsuccess = () => {
        transaction.oncomplete = () => resolve();
      };
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async ensureMetadata(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get('_meta');

      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          // Metadata doesn't exist, write it
          const putRequest = store.put({ key: '_meta', content: JSON.stringify(this.meta) });
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async save(content: string): Promise<string> {
    const db = await this.openDB();
    try {
      return await new Promise<string>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const key = generateUuid();
        const request = store.put({ key, content });

        request.onsuccess = () => resolve(key);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  }

  async delete(key: string): Promise<void> {
    const db = await this.openDB();
    try {
      return await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  }

  async list(): Promise<string[]> {
    try {
      const db = await this.openDB();
      try {
        return await new Promise<string[]>((resolve, reject) => {
          const transaction = db.transaction(this.storeName, 'readonly');
          const store = transaction.objectStore(this.storeName);
          const request = store.getAllKeys();

          transaction.onerror = () => {
            reject(transaction.error);
          };

          request.onsuccess = () => {
            const keys = request.result as string[];
            transaction.oncomplete = () => {
              resolve(keys.filter((key) => key !== '_meta'));
            };
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      } finally {
        if (db) {
          db.close();
        }
      }
    } catch (error) {
      console.error(localize('listItemsError', 'Error listing items from IndexedDB:'), error);
      return [];
    }
  }

  async read(key: string): Promise<string> {
    const db = await this.openDB();
    try {
      return await new Promise<string>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.content);
          } else {
            reject(new Error(localize('keyNotFound', 'Key not found')));
          }
        };
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  }
}
