import { encryptData } from '@/core/crypto/encryptData';

import { HbCloudSDK } from '@/packages/cloud/main';
import { TaskTokenItem } from '@/packages/cloud/server/tasks';
import { decryptData } from '@/core/crypto/encryptData';
import { IDatabaseMeta } from '@/services/database/common/database';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { decodeBase64, encodeBase64, VSBuffer } from 'vscf/base/common/buffer';

export interface SyncDatabaseResult {
  inboxFailed: boolean;
}

export async function syncDatabaseLogic(
  sdk: HbCloudSDK,
  todoService: ITodoService,
  database: IDatabaseMeta,
  inboxTokens: TaskTokenItem[] = []
): Promise<SyncDatabaseResult> {
  const res = await sdk.database.getDatabaseChanges({
    database_id: database.id,
    database_access_key: database.accessKey,
    database_salt: database.salt,
    from_version: JSON.stringify(todoService.getModelVersion(database.id)),
  });
  const data: Array<Uint8Array> = [];
  if (res.baseContent) {
    data.push(decodeBase64(decryptData(res.baseContent, database.encryptionKey)).buffer);
  }
  if (res.clients) {
    Object.entries(res.clients).forEach(([, client]) => {
      data.push(decodeBase64(decryptData(client.content, database.encryptionKey)).buffer);
    });
  }
  if (data.length > 0) {
    todoService.import(data, database.id);
  }
  let inboxFailed = false;
  if (inboxTokens.length > 0) {
    try {
      const bearer = inboxTokens[0].token;
      const { items } = await sdk.tasksInbox.claim(bearer);
      if (items.length > 0) {
        // server returns items in ascending order, we need to add them in reverse order to keep the correct order in todo service
        for (const item of items.slice().reverse()) {
          todoService.addTask({
            title: item.title,
            notes: item.notes ?? undefined,
            dueDate: item.due_date ?? undefined,
            position: { type: 'firstElement' },
          });
        }
        await sdk.tasksInbox.commit(bearer, { item_ids: items.map((i) => i.id) });
      }
    } catch {
      // swallow: inbox failures must not break database sync; caller will refresh tokens
      inboxFailed = true;
    }
  }
  const patch = todoService.exportPatch(res.baseVersion ? JSON.parse(res.baseVersion) : {}, database.id);
  const encodedPatch = encodeBase64(VSBuffer.wrap(patch));
  if (encodedPatch.length / 1024 > 10) {
    const snapshot = todoService.exportPatch({}, database.id);
    const encodedSnapshot = encodeBase64(VSBuffer.wrap(snapshot));
    await sdk.database.saveDatabaseChange({
      database_id: database.id,
      database_access_key: database.accessKey,
      database_salt: database.salt,
      from_version: null,
      to_version: JSON.stringify(todoService.getModelVersion(database.id)),
      content: encryptData(encodedSnapshot, database.encryptionKey),
    });
  } else {
    await sdk.database.saveDatabaseChange({
      database_id: database.id,
      database_access_key: database.accessKey,
      database_salt: database.salt,
      from_version: res.baseVersion,
      to_version: JSON.stringify(todoService.getModelVersion(database.id)),
      content: encryptData(encodedPatch, database.encryptionKey),
    });
  }
  return { inboxFailed };
}
