import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { parsePositionFlag, submitChangeRequest, SubmitResult, validatePosition } from '../../core/approval';
import { INSTANCE_OPTION, POSITION_OPTION, TITLE_OPTION } from '../../core/commandOptions';
import { instanceSchema, positionSchema, titleSchema } from '../../core/commandSchemas';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z
  .object({
    title: titleSchema,
    position: positionSchema,
    instance: instanceSchema,
  })
  .strict();
type Flags = z.output<typeof flagsSchema>;

function renderResult(result: SubmitResult) {
  return <Text>{['✓ request queued for approval', ...result.summary.map((line) => `- ${line}`)].join('\n')}</Text>;
}

export class AddHeadingCommand {
  static readonly meta: CommandMeta = {
    name: 'add-heading',
    description: 'Create a heading inside a project',
    options: [TITLE_OPTION, { ...POSITION_OPTION, required: true }, INSTANCE_OPTION],
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
