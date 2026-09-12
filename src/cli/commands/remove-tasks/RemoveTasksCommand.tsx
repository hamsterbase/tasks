import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { parseIdsFlag, requireTask, submitChangeRequest, SubmitResult } from '../../core/approval';
import { ID_OPTION, INSTANCE_OPTION } from '../../core/commandOptions';
import { idsSchema, instanceSchema } from '../../core/commandSchemas';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z.object({ id: idsSchema, instance: instanceSchema }).strict();
type Flags = z.output<typeof flagsSchema>;

function renderResult(result: SubmitResult) {
  return <Text>{['✓ request queued for approval', ...result.summary.map((line) => `- ${line}`)].join('\n')}</Text>;
}

export class RemoveTasksCommand {
  static readonly meta: CommandMeta = {
    name: 'remove-tasks',
    description: 'Remove several tasks in one approval request',
    options: [ID_OPTION, INSTANCE_OPTION],
    view: renderResult,
  };

  static create(args: ParsedArgs): RemoveTasksCommand {
    return new RemoveTasksCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<SubmitResult> {
    const ids = parseIdsFlag(this.flags.id);
    return submitChangeRequest({
      instanceFlag: this.flags.instance,
      buildOps: (data) => {
        const tasks = ids.map((id) => requireTask(data, id));
        return {
          ops: ids.map((uid) => ({ type: 'delete-task' as const, uid })),
          summary: tasks.map((task) => `delete "${task.title}"`),
        };
      },
    });
  }
}
