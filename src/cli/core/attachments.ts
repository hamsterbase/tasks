import * as fsp from 'fs/promises';
import * as net from 'net';
import * as path from 'path';
import { nanoid } from 'nanoid';
import {
  CLI_ATTACHMENT_MAX_BYTES,
  CliAttachmentDownload,
  CliAttachmentRequest,
  CliInstanceInfo,
  CliSocketResponse,
  NdjsonDecoder,
  serializeMessage,
} from '../../base/common/cliApproval/protocol';
import { TaskModel } from '../../core/model';
import { InspectView } from './items';

export interface AttachmentInfo {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
}

export function withAttachments<T extends InspectView>(model: TaskModel, items: T[]): T[] {
  const byParent = new Map<string, AttachmentInfo[]>();
  for (const item of model.listAllAttachments()) {
    if (item.deletedAt) continue;
    const list = byParent.get(item.parentUid) ?? [];
    list.push({ id: item.id, filename: item.filename, mimetype: item.mimetype, size: item.size });
    byParent.set(item.parentUid, list);
  }
  const visit = (item: InspectView) => {
    if (item.type === 'task' || item.type === 'project') item.attachments = byParent.get(item.id) ?? [];
    if (item.type === 'task') item.children.forEach(visit);
  };
  items.forEach(visit);
  return items;
}

export function attachmentLines(items: AttachmentInfo[], indent = ''): string[] {
  return items.map(
    (item) => `${indent}attachment: ${item.filename} [${item.id}] · ${item.mimetype} · ${item.size} bytes`
  );
}

export function requestAttachment(
  instance: CliInstanceInfo,
  parentUid: string,
  attachmentId: string
): Promise<CliAttachmentDownload> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(instance.socketPath);
    const decoder = new NdjsonDecoder();
    const request: CliAttachmentRequest = {
      id: nanoid(),
      type: 'read-attachment',
      databaseId: instance.databaseId,
      parentUid,
      attachmentId,
    };
    let settled = false;
    const finish = (error?: Error, attachment?: CliAttachmentDownload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      if (error) reject(error);
      else if (attachment) resolve(attachment);
    };
    const timer = setTimeout(() => finish(new Error('Timed out waiting for the desktop app')), 125000);
    socket.setEncoding('utf8');
    socket.on('connect', () => socket.write(serializeMessage(request)));
    socket.on('data', (chunk: string) => {
      for (const message of decoder.append(chunk)) {
        const response = message.value as CliSocketResponse | undefined;
        if (!response || response.id !== request.id) continue;
        if (!response.ok) return finish(new Error(response.error));
        const attachment = response.attachment;
        if (
          !attachment ||
          typeof attachment.base64 !== 'string' ||
          attachment.base64.length > Math.ceil(CLI_ATTACHMENT_MAX_BYTES / 3) * 4 ||
          typeof attachment.filename !== 'string' ||
          typeof attachment.mimetype !== 'string' ||
          !Number.isFinite(attachment.size) ||
          attachment.size < 0 ||
          attachment.size > CLI_ATTACHMENT_MAX_BYTES
        ) {
          return finish(new Error('Invalid attachment response from desktop app'));
        }
        finish(undefined, attachment);
      }
    });
    socket.on('error', () => finish(new Error('Could not connect to the desktop app')));
    socket.on('close', () => finish(new Error('Desktop app closed the connection')));
  });
}

/** Never use the remote filename as a path, or overwrite an existing local file. */
export async function saveAttachment(attachment: CliAttachmentDownload, output: string): Promise<string> {
  const destination = path.resolve(output);
  const bytes = Buffer.from(attachment.base64, 'base64');
  if (bytes.length !== attachment.size || bytes.length > CLI_ATTACHMENT_MAX_BYTES) {
    throw new Error('Invalid attachment data from desktop app');
  }
  const handle = await fsp.open(destination, 'wx', 0o600);
  try {
    await handle.writeFile(bytes);
  } catch (error) {
    await handle.close();
    await fsp.unlink(destination);
    throw error;
  }
  await handle.close();
  return destination;
}
