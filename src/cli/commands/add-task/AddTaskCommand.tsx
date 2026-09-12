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
    position: positionSchema.optional(),
    instance: instanceSchema,
  })
  .strict();
type Flags = z.output<typeof flagsSchema>;

function renderResult(result: SubmitResult) {
  return <Text>{['✓ request queued for approval', ...result.summary.map((line) => `- ${line}`)].join('\n')}</Text>;
}

export class AddTaskCommand {
  static readonly meta: CommandMeta = {
    name: 'add-task',
    description: 'Create a task at a tree position (defaults to the inbox)',
    options: [TITLE_OPTION, POSITION_OPTION, INSTANCE_OPTION],
    view: renderResult,
  };

  static create(args: ParsedArgs): AddTaskCommand {
    return new AddTaskCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<SubmitResult> {
    const { title, position: positionValue } = this.flags;
    const position = positionValue ? parsePositionFlag(positionValue) : undefined;
    return submitChangeRequest({
      instanceFlag: this.flags.instance,
      buildOps: (data) => {
        if (position) {
          validatePosition(data, position, { type: 'task' });
        }
        return {
          ops: [{ type: 'create-task', title, position }],
          summary: [`create task "${title}"${position ? ` at ${positionValue}` : ' in inbox'}`],
        };
      },
    });
  }
}
