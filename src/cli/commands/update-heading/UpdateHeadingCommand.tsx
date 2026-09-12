import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { CliHeadingUpdatePayload } from '../../../base/common/cliApproval/protocol';
import {
  readExplanation,
  parsePositionFlag,
  requireHeading,
  submitChangeRequest,
  SubmitResult,
  validatePosition,
} from '../../core/approval';
import {
  EXPLANATION_OPTIONS,
  ID_OPTION,
  INSTANCE_OPTION,
  POSITION_OPTION,
  TITLE_OPTION,
} from '../../core/commandOptions';
import { idSchema, approvalCommandSchema, positionSchema, titleSchema } from '../../core/commandSchemas';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = approvalCommandSchema
  .extend({
    id: idSchema,
    title: titleSchema.optional(),
    position: positionSchema.optional(),
  })
  .refine((flags) => flags.title !== undefined || flags.position !== undefined, {
    message: 'title or position is required',
  });
type Flags = z.output<typeof flagsSchema>;

function renderResult(result: SubmitResult) {
  return <Text>{['✓ request queued for approval', ...result.summary.map((line) => `- ${line}`)].join('\n')}</Text>;
}

export class UpdateHeadingCommand {
  static readonly meta: CommandMeta = {
    name: 'update-heading',
    description: 'Update a project heading',
    options: [
      ...EXPLANATION_OPTIONS,
      ID_OPTION,
      { ...TITLE_OPTION, required: false },
      POSITION_OPTION,
      INSTANCE_OPTION,
    ],
    view: renderResult,
  };

  static create(args: ParsedArgs): UpdateHeadingCommand {
    return new UpdateHeadingCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<SubmitResult> {
    const uid = this.flags.id;
    const payload: CliHeadingUpdatePayload = {};
    const fields: string[] = [];
    const { title, position: positionValue } = this.flags;
    if (title !== undefined) {
      payload.title = title;
      fields.push('title');
    }
    if (positionValue !== undefined) {
      payload.position = parsePositionFlag(positionValue);
      fields.push('position');
    }
    return submitChangeRequest({
      explanation: await readExplanation(this.flags),
      instanceFlag: this.flags.instance,
      buildOps: (data) => {
        const heading = requireHeading(data, uid);
        if (payload.position) {
          validatePosition(data, payload.position, { type: 'projectHeading', uid });
        }
        return {
          ops: [{ type: 'update-heading', uid, payload }],
          summary: [`update heading "${heading.title}" (${fields.join(', ')})`],
        };
      },
    });
  }
}
