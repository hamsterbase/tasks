import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { requireTask, submitChangeRequest, SubmitResult } from '../../core/approval';
import { ID_OPTION, INSTANCE_OPTION } from '../../core/commandOptions';
import { idSchema, instanceSchema } from '../../core/commandSchemas';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z.object({ id: idSchema, instance: instanceSchema }).strict();
type Flags = z.output<typeof flagsSchema>;

function renderResult(result: SubmitResult) {
  return <Text>{['✓ request queued for approval', ...result.summary.map((line) => `- ${line}`)].join('\n')}</Text>;
}

export class RemoveTaskCommand {
  static readonly meta: CommandMeta = {
    name: 'remove-task',
    description: 'Remove one task',
    options: [ID_OPTION, INSTANCE_OPTION],
    view: renderResult,
  };

  static create(args: ParsedArgs): RemoveTaskCommand {
    return new RemoveTaskCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<SubmitResult> {
    return submitChangeRequest({
      instanceFlag: this.flags.instance,
      buildOps: (data) => {
        const task = requireTask(data, this.flags.id);
        return {
          ops: [{ type: 'delete-task', uid: this.flags.id }],
          summary: [`delete "${task.title}"`],
        };
      },
    });
  }
}
