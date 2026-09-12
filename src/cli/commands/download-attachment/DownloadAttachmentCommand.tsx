import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { loadInstanceContext } from '../../core/approval';
import { requestAttachment, saveAttachment } from '../../core/attachments';
import { ID_OPTION, INSTANCE_OPTION } from '../../core/commandOptions';
import { idSchema, instanceSchema } from '../../core/commandSchemas';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z
  .object({ id: idSchema, attachment: z.string().trim().min(1), output: z.string().min(1), instance: instanceSchema })
  .strict();
type Flags = z.output<typeof flagsSchema>;

export class DownloadAttachmentCommand {
  static readonly meta: CommandMeta = {
    name: 'download-attachment',
    description: 'Download a task or project attachment to a local file',
    minProtocolVersion: 2,
    options: [
      ID_OPTION,
      { name: 'attachment', arg: '<attachment-id>', description: 'Attachment id from inspect or view-tasks' },
      { name: 'output', arg: '<path>', description: 'Destination file path; must not already exist' },
      INSTANCE_OPTION,
    ],
    view: (result: { path: string }) => <Text>{result.path}</Text>,
  };

  static create(args: ParsedArgs): DownloadAttachmentCommand {
    return new DownloadAttachmentCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec() {
    const { instance } = await loadInstanceContext(this.flags.instance);
    const attachment = await requestAttachment(instance, this.flags.id, this.flags.attachment);
    const output = await saveAttachment(attachment, this.flags.output);
    return { path: output, filename: attachment.filename, mimetype: attachment.mimetype, size: attachment.size };
  }
}
