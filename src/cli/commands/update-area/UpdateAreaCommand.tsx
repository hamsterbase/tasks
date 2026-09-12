import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { CliAreaUpdatePayload } from '../../../base/common/cliApproval/protocol';
import {
  parsePositionFlag,
  parseTagsFlag,
  requireArea,
  submitChangeRequest,
  SubmitResult,
  validatePosition,
} from '../../core/approval';
import { ID_OPTION, INSTANCE_OPTION, POSITION_OPTION, TAGS_OPTION, TITLE_OPTION } from '../../core/commandOptions';
import { idSchema, instanceSchema, positionSchema, titleSchema } from '../../core/commandSchemas';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z
  .object({
    id: idSchema,
    title: titleSchema.optional(),
    tags: z.string().optional(),
    position: positionSchema.optional(),
    instance: instanceSchema,
  })
  .strict()
  .refine((flags) => flags.title !== undefined || flags.tags !== undefined || flags.position !== undefined, {
    message: 'title, tags, or position is required',
  });
type Flags = z.output<typeof flagsSchema>;

function renderResult(result: SubmitResult) {
  return <Text>{['✓ request queued for approval', ...result.summary.map((line) => `- ${line}`)].join('\n')}</Text>;
}

export class UpdateAreaCommand {
  static readonly meta: CommandMeta = {
    name: 'update-area',
    description: 'Update an area',
    options: [ID_OPTION, { ...TITLE_OPTION, required: false }, TAGS_OPTION, POSITION_OPTION, INSTANCE_OPTION],
    view: renderResult,
  };

  static create(args: ParsedArgs): UpdateAreaCommand {
    return new UpdateAreaCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<SubmitResult> {
    const uid = this.flags.id;
    const payload: CliAreaUpdatePayload = {};
    const fields: string[] = [];
    const { title, tags, position: positionValue } = this.flags;
    if (title !== undefined) {
      payload.title = title;
      fields.push('title');
    }
    if (tags !== undefined) {
      payload.tags = parseTagsFlag(tags);
      fields.push('tags');
    }
    if (positionValue !== undefined) {
      payload.position = parsePositionFlag(positionValue);
      fields.push('position');
    }
    return submitChangeRequest({
      instanceFlag: this.flags.instance,
      buildOps: (data) => {
        const area = requireArea(data, uid);
        if (payload.position) {
          validatePosition(data, payload.position, { type: 'area', uid });
        }
        return {
          ops: [{ type: 'update-area', uid, payload }],
          summary: [`update area "${area.title}" (${fields.join(', ')})`],
        };
      },
    });
  }
}
