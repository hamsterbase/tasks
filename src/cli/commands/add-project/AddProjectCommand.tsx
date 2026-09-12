import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { readExplanation, requireArea, submitChangeRequest, SubmitResult } from '../../core/approval';
import { EXPLANATION_OPTIONS, INSTANCE_OPTION, TITLE_OPTION } from '../../core/commandOptions';
import { idSchema, approvalCommandSchema, titleSchema } from '../../core/commandSchemas';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = approvalCommandSchema.extend({
  title: titleSchema,
  parent: idSchema.optional(),
});
type Flags = z.output<typeof flagsSchema>;

function renderResult(result: SubmitResult) {
  return <Text>{['✓ request queued for approval', ...result.summary.map((line) => `- ${line}`)].join('\n')}</Text>;
}

export class AddProjectCommand {
  static readonly meta: CommandMeta = {
    name: 'add-project',
    description: 'Create a project in the root or an area',
    options: [
      ...EXPLANATION_OPTIONS,
      TITLE_OPTION,
      { name: 'parent', arg: '<area-id>', description: 'Area id; omit to create a root project' },
      INSTANCE_OPTION,
    ],
    view: renderResult,
  };

  static create(args: ParsedArgs): AddProjectCommand {
    return new AddProjectCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<SubmitResult> {
    const { title, parent: parentUid } = this.flags;
    return submitChangeRequest({
      explanation: await readExplanation(this.flags),
      instanceFlag: this.flags.instance,
      buildOps: (data) => {
        const parent = parentUid ? requireArea(data, parentUid) : undefined;
        return {
          ops: [{ type: 'create-project', title, parentUid }],
          summary: [`create project "${title}"${parent ? ` in "${parent.title}"` : ''}`],
        };
      },
    });
  }
}
