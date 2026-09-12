import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { CliCreateItem } from '../../../base/common/cliApproval/protocol';
import {
  readExplanation,
  parseCreateItemsFlag,
  parsePositionFlag,
  submitChangeRequest,
  SubmitResult,
  validatePosition,
} from '../../core/approval';
import { EXPLANATION_OPTIONS, INSTANCE_OPTION, POSITION_OPTION } from '../../core/commandOptions';
import { dateSchema, approvalCommandSchema, positionSchema, titleSchema } from '../../core/commandSchemas';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const childrenArray = (value: unknown) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

const importDateSchema = dateSchema.refine((value) => value !== 'none', 'cannot be none');

const taskSchema: z.ZodType = z.lazy(() =>
  z.union([
    z.string().min(1),
    z
      .object({
        type: z.literal('task').optional(),
        title: titleSchema,
        notes: z.string().optional(),
        startDate: importDateSchema.optional(),
        dueDate: importDateSchema.optional(),
        tags: z.array(z.string()).optional(),
        children: z.preprocess(childrenArray, z.array(taskSchema)).optional(),
      })
      .strict(),
  ])
);

const headingSchema = z
  .object({
    type: z.literal('heading'),
    title: titleSchema,
    children: z.preprocess(childrenArray, z.array(taskSchema)).optional(),
  })
  .strict();

const projectSchema = z
  .object({
    type: z.literal('project'),
    title: titleSchema,
    notes: z.string().optional(),
    startDate: importDateSchema.optional(),
    dueDate: importDateSchema.optional(),
    tags: z.array(z.string()).optional(),
    children: z.preprocess(childrenArray, z.array(z.union([taskSchema, headingSchema]))).optional(),
  })
  .strict();

const itemsSchema = z.preprocess(childrenArray, z.array(z.union([projectSchema, headingSchema, taskSchema])).min(1));

const contentSchema = z
  .string()
  .transform((value, context) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      context.addIssue({ code: 'custom', message: 'must be valid JSON' });
      return z.NEVER;
    }
  })
  .pipe(itemsSchema);

const flagsSchema = approvalCommandSchema.extend({
  content: contentSchema,
  position: positionSchema.optional(),
});
type Flags = z.output<typeof flagsSchema>;

function renderResult(result: SubmitResult) {
  return <Text>{['✓ request queued for approval', ...result.summary.map((line) => `- ${line}`)].join('\n')}</Text>;
}

function itemObjectType(item: CliCreateItem): 'task' | 'projectHeading' | 'project' {
  switch (item.type) {
    case 'task':
      return 'task';
    case 'heading':
      return 'projectHeading';
    case 'project':
      return 'project';
  }
}

export class AddItemsCommand {
  static readonly meta: CommandMeta = {
    name: 'add-items',
    description: 'Create an ordered task, heading, or project tree in one approval request',
    options: [
      ...EXPLANATION_OPTIONS,
      {
        name: 'content',
        arg: '<json>',
        description: 'One item or an array of task, heading, or project items',
        required: true,
      },
      POSITION_OPTION,
      INSTANCE_OPTION,
    ],
    view: renderResult,
  };

  static create(args: ParsedArgs): AddItemsCommand {
    return new AddItemsCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<SubmitResult> {
    const items = parseCreateItemsFlag(JSON.stringify(this.flags.content));
    const positionValue = this.flags.position;
    const position = positionValue ? parsePositionFlag(positionValue) : undefined;
    return submitChangeRequest({
      explanation: await readExplanation(this.flags),
      instanceFlag: this.flags.instance,
      buildOps: (data) => {
        const initialPosition = position ?? { type: 'firstElement' as const };
        for (const item of items) {
          validatePosition(data, initialPosition, {
            type: itemObjectType(item),
            hasChildren: (item.children ?? []).length > 0,
          });
        }
        return {
          ops: [{ type: 'create-items', items, position }],
          summary: [`create ${items.length} top-level item(s)${positionValue ? ` at ${positionValue}` : ' at root'}`],
        };
      },
    });
  }
}
