import { AttachmentSchema } from '@/core/type';
import { Event } from 'vscf/base/common/event';
import { createDecorator } from 'vscf/platform/instantiation/common';

export interface S3Config {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  keyPrefix?: string;
  forcePathStyle?: boolean;
}

export interface TestConnectionResult {
  ok: boolean;
  error?: string;
}

export type UploadStatus = 'queued' | 'uploading' | 'failed';

export interface UploadItem {
  id: string;
  parentUid: string;
  filename: string;
  size: number;
  mimetype: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export interface IAttachmentUploadService {
  readonly _serviceBrand: undefined;
  onChange: Event<void>;

  getConfig(): S3Config | null;
  setConfig(config: S3Config | null): Promise<void>;
  testConnection(config: S3Config): Promise<TestConnectionResult>;

  uploadFiles(files: File[], parentUid: string): void;
  cancelUpload(uploadId: string): void;
  retryUpload(uploadId: string): void;

  getActiveUploadCount(): number;
  getUploadsForParent(parentUid: string): UploadItem[];
  cancelAllUploads(): Promise<void>;

  listAttachmentsByParent(parentUid: string): AttachmentSchema[];
  softDelete(attachmentId: string): void;

  getThumbnailUrl(s3Key: string): Promise<string | null>;
  getObjectUrl(s3Key: string): Promise<string | null>;
  downloadAttachment(s3Key: string, filename: string): Promise<void>;
}

export const IAttachmentUploadService = createDecorator<IAttachmentUploadService>('IAttachmentUploadService');
