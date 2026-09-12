import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { CliTaskUpdatePayload } from '../../../base/common/cliApproval/protocol';
import {
  readExplanation,
  parseDateFlag,
  parsePositionFlag,
  parseTagsFlag,
  requireTask,
  submitChangeRequest,
  SubmitResult,
  validatePosition,
} from '../../core/approval';
import {
  EXPLANATION_OPTIONS,
  DUE_DATE_OPTION,
  ID_OPTION,
  INSTANCE_OPTION,
  parseStatusFlag,
  POSITION_OPTION,
  START_DATE_OPTION,
  TAGS_OPTION,
  TITLE_OPTION,
} from '../../core/commandOptions';
import {
  dateSchema,
  idSchema,
  approvalCommandSchema,
  positionSchema,
  statusSchema,
  titleSchema,
} from '../../core/commandSchemas';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = approvalCommandSchema
  .extend({
    id: idSchema,
    title: titleSchema.optional(),
    notes: z.string().optional(),
    'start-date': dateSchema.optional(),
    'due-date': dateSchema.optional(),
    tags: z.string().optional(),
    status: statusSchema.optional(),
    position: positionSchema.optional(),
  })
  .refine(
    (flags) =>
      ['title', 'notes', 'start-date', 'due-date', 'tags', 'status', 'position'].some(
        (name) => flags[name as keyof typeof flags] !== undefined
      ),
    { message: 'at least one update field is required' }
  );
type Flags = z.output<typeof flagsSchema>;

function renderResult(result: SubmitResult) {
  return <Text>{['✓ request queued for approval', ...result.summary.map((line) => `- ${line}`)].join('\n')}</Text>;
}

export class UpdateTaskCommand {
  static readonly meta: CommandMeta = {
    name: 'update-task',
    description: 'Update a single task',
    options: [
      ...EXPLANATION_OPTIONS,
      { ...ID_OPTION, description: 'Stable task id' },
      { ...TITLE_OPTION, required: false },
      { name: 'notes', arg: '<text|none>', description: 'Notes; "none" clears them' },
      START_DATE_OPTION,
      DUE_DATE_OPTION,
      TAGS_OPTION,
      { name: 'status', arg: '<complete|canceled|created>', description: 'Task status' },
      POSITION_OPTION,
      INSTANCE_OPTION,
    ],
    view: renderResult,
  };

  static create(args: ParsedArgs): UpdateTaskCommand {
    return new UpdateTaskCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<SubmitResult> {
    const uid = this.flags.id;
    const payload: CliTaskUpdatePayload = {};
    const fields: string[] = [];
    const { title, 'start-date': startDate, 'due-date': dueDate, tags, status, position: positionValue } = this.flags;
    const notes = this.flags.notes === 'none' ? '' : this.flags.notes;

    if (title !== undefined) {
      payload.title = title;
      fields.push('title');
    }
    if (notes !== undefined) {
      payload.notes = notes;
      fields.push('notes');
    }
    if (startDate !== undefined) {
      payload.startDate = parseDateFlag('start-date', startDate);
      fields.push('start-date');
    }
    if (dueDate !== undefined) {
      payload.dueDate = parseDateFlag('due-date', dueDate);
      fields.push('due-date');
    }
    if (tags !== undefined) {
      payload.tags = parseTagsFlag(tags);
      fields.push('tags');
    }
    if (status !== undefined) {
      payload.status = parseStatusFlag(status);
      fields.push('status');
    }
    if (positionValue !== undefined) {
      payload.position = parsePositionFlag(positionValue);
      fields.push('position');
    }
    return submitChangeRequest({
      explanation: await readExplanation(this.flags),
      instanceFlag: this.flags.instance,
      buildOps: (data) => {
        const task = requireTask(data, uid);
        if (payload.position) {
          validatePosition(data, payload.position, { type: 'task', uid });
        }
        return {
          ops: [{ type: 'update-task', uid, payload }],
          summary: [`update "${task.title}" (${fields.join(', ')})`],
        };
      },
    });
  }
}
