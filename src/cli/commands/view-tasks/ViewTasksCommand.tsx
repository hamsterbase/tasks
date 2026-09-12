import { withAttachments, attachmentLines } from '../../core/attachments';
import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { loadInstanceContext, parseIdsFlag } from '../../core/approval';
import { ID_OPTION, INSTANCE_OPTION } from '../../core/commandOptions';
import { idsSchema, instanceSchema } from '../../core/commandSchemas';
import { getTaskDetails, TaskDetail } from '../../core/items';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z.object({ id: idsSchema, instance: instanceSchema }).strict();
type Flags = z.output<typeof flagsSchema>;

function detailLines(task: TaskDetail, depth = 0): string[] {
  const indent = '  '.repeat(depth);
  return [
    `${indent}${task.title} [${task.id}]`,
    `${indent}status: ${task.status} · location: ${task.location}`,
    ...(task.notes ? [`${indent}notes: ${task.notes}`] : []),
    ...attachmentLines(task.attachments, indent),
    ...task.children.flatMap((child) => detailLines(child, depth + 1)),
  ];
}

function renderTasks(tasks: TaskDetail[]) {
  return <Text>{tasks.flatMap((task) => detailLines(task)).join('\n')}</Text>;
}

export class ViewTasksCommand {
  static readonly meta: CommandMeta = {
    name: 'view-tasks',
    description: 'Show detailed task information',
    options: [ID_OPTION, INSTANCE_OPTION],
    view: renderTasks,
  };

  static create(args: ParsedArgs): ViewTasksCommand {
    return new ViewTasksCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<TaskDetail[]> {
    const { model } = await loadInstanceContext(this.flags.instance);
    const ids = parseIdsFlag(this.flags.id);
    return withAttachments(model, getTaskDetails(model.toJSON(), ids));
  }
}
