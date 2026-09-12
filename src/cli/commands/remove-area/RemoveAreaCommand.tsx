import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { readExplanation, requireArea, submitChangeRequest, SubmitResult } from '../../core/approval';
import { EXPLANATION_OPTIONS, ID_OPTION, INSTANCE_OPTION } from '../../core/commandOptions';
import { idSchema, approvalCommandSchema } from '../../core/commandSchemas';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = approvalCommandSchema.extend({ id: idSchema });
type Flags = z.output<typeof flagsSchema>;

function renderResult(result: SubmitResult) {
  return <Text>{['✓ request queued for approval', ...result.summary.map((line) => `- ${line}`)].join('\n')}</Text>;
}

export class RemoveAreaCommand {
  static readonly meta: CommandMeta = {
    name: 'remove-area',
    description: 'Remove an area and its contents',
    options: [...EXPLANATION_OPTIONS, ID_OPTION, INSTANCE_OPTION],
    view: renderResult,
  };

  static create(args: ParsedArgs): RemoveAreaCommand {
    return new RemoveAreaCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<SubmitResult> {
    return submitChangeRequest({
      explanation: await readExplanation(this.flags),
      instanceFlag: this.flags.instance,
      buildOps: (data) => {
        const area = requireArea(data, this.flags.id);
        return {
          ops: [{ type: 'delete-area', uid: this.flags.id }],
          summary: [`delete area "${area.title}"`],
        };
      },
    });
  }
}
