import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import {
  readExplanation,
  parsePositionFlag,
  submitChangeRequest,
  SubmitResult,
  validatePosition,
} from '../../core/approval';
import { EXPLANATION_OPTIONS, INSTANCE_OPTION, POSITION_OPTION, TITLE_OPTION } from '../../core/commandOptions';
import { approvalCommandSchema, positionSchema, titleSchema } from '../../core/commandSchemas';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = approvalCommandSchema.extend({
  title: titleSchema,
  position: positionSchema,
});
type Flags = z.output<typeof flagsSchema>;

function renderResult(result: SubmitResult) {
  return <Text>{['✓ request queued for approval', ...result.summary.map((line) => `- ${line}`)].join('\n')}</Text>;
}

export class AddHeadingCommand {
  static readonly meta: CommandMeta = {
    name: 'add-heading',
    description: 'Create a heading inside a project',
    options: [...EXPLANATION_OPTIONS, TITLE_OPTION, { ...POSITION_OPTION, required: true }, INSTANCE_OPTION],
    view: renderResult,
  };

  static create(args: ParsedArgs): AddHeadingCommand {
    return new AddHeadingCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<SubmitResult> {
    const { title, position: positionValue } = this.flags;
    const position = parsePositionFlag(positionValue);
    return submitChangeRequest({
      explanation: await readExplanation(this.flags),
      instanceFlag: this.flags.instance,
      buildOps: (data) => {
        validatePosition(data, position, { type: 'projectHeading' });
        return {
          ops: [{ type: 'create-heading', title, position }],
          summary: [`create heading "${title}" at ${positionValue}`],
        };
      },
    });
  }
}
