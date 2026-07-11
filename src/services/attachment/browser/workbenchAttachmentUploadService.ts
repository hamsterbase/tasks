import { S3Client, HeadBucketCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { nanoid } from 'nanoid';
import { Emitter, Event } from '@hamsterbase/foundation/event';
import { AttachmentSchema } from '@/core/type';
import { ConfigKey, IConfigService } from '@/services/config/configService';
import { ICloudService } from '@/services/cloud/common/cloudService';
import { ITodoService } from '@/services/todo/common/todoService';
import {
  IAttachmentUploadService,
  S3Config,
  TestConnectionResult,
  UploadItem,
} from '../common/attachmentUploadService';

const MAX_CONCURRENT_UPLOADS = 3;
const THUMBNAIL_MAX_DIMENSION = 256;
const THUMBNAIL_QUALITY = 0.8;
const THUMBNAIL_SUFFIX = '.thumb.jpg';

function s3ConfigKey(databaseId: string): ConfigKey<S3Config | null> {
  return {
    key: `s3-config-${databaseId}`,
    default: null,
    check: (value) => value === null || (typeof value === 'object' && value !== null),
  };
}

interface InternalUpload {
  item: UploadItem;
  file: File;
  attachmentId: string;
  thumbnailBlob: Blob | null;
  upload?: Upload;
  thumbnailUpload?: Upload;
  aborted: boolean;
}

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot < 0 || lastDot === filename.length - 1) {
    return '';
  }
  return filename.slice(lastDot + 1).toLowerCase();
}

function buildS3Key(prefix: string, databaseId: string, attachmentId: string, ext: string): string {
  const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : '';
  const base = `${normalizedPrefix}${databaseId}/attachments/${attachmentId}`;
  return ext ? `${base}.${ext}` : base;
}

async function generateThumbnail(file: File): Promise<Blob | null> {
  if (!file.type.startsWith('image/')) return null;
  if (file.type === 'image/svg+xml') return null;
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, THUMBNAIL_MAX_DIMENSION / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas =
      typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(targetWidth, targetHeight)
        : (() => {
            const c = document.createElement('canvas');
            c.width = targetWidth;
            c.height = targetHeight;
            return c;
          })();
    const ctx = (canvas as OffscreenCanvas).getContext('2d') as
      | OffscreenCanvasRenderingContext2D
      | CanvasRenderingContext2D
      | null;
    if (!ctx) {
      bitmap.close();
      return null;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();
    if (canvas instanceof OffscreenCanvas) {
      return await canvas.convertToBlob({ type: 'image/jpeg', quality: THUMBNAIL_QUALITY });
    }
    return await new Promise<Blob | null>((resolve) =>
      (canvas as HTMLCanvasElement).toBlob((b) => resolve(b), 'image/jpeg', THUMBNAIL_QUALITY)
    );
  } catch {
    return null;
  }
}

export class WorkbenchAttachmentUploadService implements IAttachmentUploadService {
  public readonly _serviceBrand: undefined;

  private readonly _onChange = new Emitter<void>();
  public onChange: Event<void> = this._onChange.event;

  private uploads = new Map<string, InternalUpload>();
  private cachedClient: S3Client | null = null;
  private cachedConfigSignature: string | null = null;

  private attachmentCache: { byParent: Map<string, AttachmentSchema[]> } | null = null;

  constructor(
    @IConfigService private configService: IConfigService,
    @ICloudService private cloudService: ICloudService,
    @ITodoService private todoService: ITodoService
  ) {
    this.cloudService.onSessionChange(() => {
      this.cachedClient = null;
      this.cachedConfigSignature = null;
      this._onChange.fire();
    });
    this.todoService.onStateChange(() => {
      this.attachmentCache = null;
      this._onChange.fire();
    });
  }

  private buildAttachmentCache(): { byParent: Map<string, AttachmentSchema[]> } {
    const byParent = new Map<string, AttachmentSchema[]>();
    const all = this.todoService.listAllAttachments();
    for (const entry of all) {
      if (entry.deletedAt) continue;
      const list = byParent.get(entry.parentUid);
      if (list) {
        list.push(entry);
      } else {
        byParent.set(entry.parentUid, [entry]);
      }
    }
    for (const list of byParent.values()) {
      list.sort((a, b) => b.createdAt - a.createdAt);
    }
    return { byParent };
  }

  listAttachmentsByParent(parentUid: string): AttachmentSchema[] {
    if (!this.attachmentCache) {
      this.attachmentCache = this.buildAttachmentCache();
    }
    return this.attachmentCache.byParent.get(parentUid) ?? [];
  }

  softDelete(attachmentId: string): void {
    this.todoService.softDeleteAttachment(attachmentId);
  }

  private get currentDatabaseId(): string {
    return this.cloudService.databaseConfig;
  }

  getConfig(): S3Config | null {
    return this.configService.get(s3ConfigKey(this.currentDatabaseId));
  }

  async setConfig(config: S3Config | null): Promise<void> {
    await this.configService.save(s3ConfigKey(this.currentDatabaseId), config);
    this.cachedClient = null;
    this.cachedConfigSignature = null;
    this._onChange.fire();
  }

  private buildClient(config: S3Config): S3Client {
    const signature = JSON.stringify(config);
    if (this.cachedClient && this.cachedConfigSignature === signature) {
      return this.cachedClient;
    }
    const client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: !!config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.cachedClient = client;
    this.cachedConfigSignature = signature;
    return client;
  }

  async testConnection(config: S3Config): Promise<TestConnectionResult> {
    try {
      const client = new S3Client({
        region: config.region,
        endpoint: config.endpoint,
        forcePathStyle: !!config.forcePathStyle,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      });
      await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, error: message };
    }
  }

  uploadFiles(files: File[], parentUid: string): void {
    const config = this.getConfig();
    if (!config) return;
    for (const file of files) {
      const id = nanoid();
      const internal: InternalUpload = {
        item: {
          id,
          parentUid,
          filename: file.name,
          size: file.size,
          mimetype: file.type || 'application/octet-stream',
          progress: 0,
          status: 'queued',
        },
        file,
        attachmentId: nanoid(),
        thumbnailBlob: null,
        aborted: false,
      };
      this.uploads.set(id, internal);
    }
    this._onChange.fire();
    void this.pumpQueue();
  }

  private async pumpQueue(): Promise<void> {
    const config = this.getConfig();
    if (!config) return;
    const active = Array.from(this.uploads.values()).filter((u) => u.item.status === 'uploading').length;
    const available = MAX_CONCURRENT_UPLOADS - active;
    if (available <= 0) return;
    const queued = Array.from(this.uploads.values()).filter((u) => u.item.status === 'queued');
    for (let i = 0; i < Math.min(available, queued.length); i++) {
      const next = queued[i];
      next.item.status = 'uploading';
      this._onChange.fire();
      void this.runUpload(next).catch(() => {
        // runUpload handles its own state
      });
    }
  }

  private async runUpload(internal: InternalUpload): Promise<void> {
    const config = this.getConfig();
    if (!config) {
      internal.item.status = 'failed';
      internal.item.error = 'S3 not configured';
      this._onChange.fire();
      return;
    }
    const databaseId = this.currentDatabaseId;
    const ext = getExtension(internal.file.name);
    const s3Key = buildS3Key(config.keyPrefix ?? '', databaseId, internal.attachmentId, ext);

    let thumbnailBlob: Blob | null = null;
    try {
      thumbnailBlob = await generateThumbnail(internal.file);
    } catch {
      thumbnailBlob = null;
    }
    if (internal.aborted) return;
    internal.thumbnailBlob = thumbnailBlob;

    const client = this.buildClient(config);
    try {
      const upload = new Upload({
        client,
        params: {
          Bucket: config.bucket,
          Key: s3Key,
          Body: internal.file,
          ContentType: internal.item.mimetype,
        },
        queueSize: 4,
        partSize: 5 * 1024 * 1024,
      });
      internal.upload = upload;
      upload.on('httpUploadProgress', (progress) => {
        if (progress.total && progress.loaded != null) {
          internal.item.progress = progress.loaded / progress.total;
          this._onChange.fire();
        }
      });
      await upload.done();
      if (internal.aborted) return;

      if (thumbnailBlob) {
        const thumbnailKey = `${s3Key}${THUMBNAIL_SUFFIX}`;
        const thumbnailUpload = new Upload({
          client,
          params: {
            Bucket: config.bucket,
            Key: thumbnailKey,
            Body: thumbnailBlob,
            ContentType: 'image/jpeg',
          },
        });
        internal.thumbnailUpload = thumbnailUpload;
        try {
          await thumbnailUpload.done();
        } catch {
          // thumbnail failure is non-fatal; mark as not having thumbnail
          thumbnailBlob = null;
        }
      }

      if (internal.aborted) return;

      this.todoService.addAttachment({
        id: internal.attachmentId,
        parentUid: internal.item.parentUid,
        filename: internal.file.name,
        size: internal.file.size,
        mimetype: internal.item.mimetype,
        hasThumbnail: !!thumbnailBlob,
        s3Key,
      });

      this.uploads.delete(internal.item.id);
      this._onChange.fire();
      void this.pumpQueue();
    } catch (error) {
      if (internal.aborted) {
        this.uploads.delete(internal.item.id);
        this._onChange.fire();
        void this.pumpQueue();
        return;
      }
      internal.item.status = 'failed';
      internal.item.error = error instanceof Error ? error.message : String(error);
      this._onChange.fire();
      void this.pumpQueue();
    }
  }

  cancelUpload(uploadId: string): void {
    const internal = this.uploads.get(uploadId);
    if (!internal) return;
    internal.aborted = true;
    if (internal.upload) {
      void internal.upload.abort().catch(() => undefined);
    }
    if (internal.thumbnailUpload) {
      void internal.thumbnailUpload.abort().catch(() => undefined);
    }
    this.uploads.delete(uploadId);
    this._onChange.fire();
    void this.pumpQueue();
  }

  retryUpload(uploadId: string): void {
    const internal = this.uploads.get(uploadId);
    if (!internal || internal.item.status !== 'failed') return;
    internal.item.status = 'queued';
    internal.item.error = undefined;
    internal.item.progress = 0;
    internal.aborted = false;
    internal.upload = undefined;
    internal.thumbnailUpload = undefined;
    this._onChange.fire();
    void this.pumpQueue();
  }

  getActiveUploadCount(): number {
    return Array.from(this.uploads.values()).filter((u) => u.item.status === 'queued' || u.item.status === 'uploading')
      .length;
  }

  getUploadsForParent(parentUid: string): UploadItem[] {
    const result: UploadItem[] = [];
    for (const internal of this.uploads.values()) {
      if (internal.item.parentUid === parentUid) {
        result.push({ ...internal.item });
      }
    }
    return result;
  }

  async cancelAllUploads(): Promise<void> {
    const ids = Array.from(this.uploads.keys());
    for (const id of ids) {
      this.cancelUpload(id);
    }
  }

  async getThumbnailUrl(s3Key: string): Promise<string | null> {
    const config = this.getConfig();
    if (!config) return null;
    const client = this.buildClient(config);
    try {
      const response = await client.send(
        new GetObjectCommand({
          Bucket: config.bucket,
          Key: `${s3Key}${THUMBNAIL_SUFFIX}`,
        })
      );
      const stream = response.Body as ReadableStream | undefined;
      if (!stream) return null;
      const blob = await new Response(stream).blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }

  async getObjectUrl(s3Key: string): Promise<string | null> {
    const config = this.getConfig();
    if (!config) return null;
    const client = this.buildClient(config);
    try {
      const response = await client.send(
        new GetObjectCommand({
          Bucket: config.bucket,
          Key: s3Key,
        })
      );
      const stream = response.Body as ReadableStream | undefined;
      if (!stream) return null;
      const blob = await new Response(stream).blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }

  async downloadAttachment(s3Key: string, filename: string): Promise<void> {
    const config = this.getConfig();
    if (!config) throw new Error('S3 not configured');
    const client = this.buildClient(config);
    const response = await client.send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: s3Key,
      })
    );
    const stream = response.Body as ReadableStream | undefined;
    if (!stream) throw new Error('Empty response body');
    const blob = await new Response(stream).blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
