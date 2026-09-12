import {
  CliAttachmentDownload,
  CliAttachmentRequest,
  CLI_ATTACHMENT_MAX_BYTES,
} from '@/base/common/cliApproval/protocol';
import { IAttachmentUploadService } from '@/services/attachment/common/attachmentUploadService';
import { ITodoService } from '@/services/todo/common/todoService';

export async function readAttachment(
  todoService: ITodoService,
  attachments: IAttachmentUploadService,
  request: CliAttachmentRequest
): Promise<CliAttachmentDownload> {
  if (request.databaseId !== todoService.storageId) throw new Error('The active database changed');
  const parent = todoService.modelState.taskObjectUidMap.get(request.parentUid);
  if (!parent || (parent.type !== 'task' && parent.type !== 'project')) throw new Error('Task or project not found');
  const attachment = attachments
    .listAttachmentsByParent(request.parentUid)
    .find((item) => item.id === request.attachmentId && !item.deletedAt);
  if (!attachment) throw new Error('Attachment not found');
  if (attachment.size > CLI_ATTACHMENT_MAX_BYTES) throw new Error('CLI downloads support attachments up to 32 MiB');
  const bytes = await attachments.readAttachmentBytes(attachment.s3Key, CLI_ATTACHMENT_MAX_BYTES);
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  const base64 = btoa(binary);
  if (request.databaseId !== todoService.storageId) throw new Error('The active database changed');
  return { base64, filename: attachment.filename, mimetype: attachment.mimetype, size: bytes.byteLength };
}
