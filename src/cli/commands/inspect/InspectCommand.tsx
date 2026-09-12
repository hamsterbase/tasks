import { withAttachments, attachmentLines } from '../../core/attachments';
import { Text } from 'ink';
import React from 'react';
import { z } from 'zod';
import { loadInstanceContext, parseIdsFlag } from '../../core/approval';
import { FILTER_OPTIONS, ID_OPTION } from '../../core/commandOptions';
import { idsSchema, visibilitySchema } from '../../core/commandSchemas';
import {
  AreaView,
  HeadingView,
  InspectView,
  ProjectTreeNode,
  ProjectView,
  TaskDetail,
  inspectItems,
} from '../../core/items';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z.object({ id: idsSchema, ...visibilitySchema }).strict();
type Flags = z.output<typeof flagsSchema>;

function treeLines(nodes: ProjectTreeNode[], prefix = ''): string[] {
  return nodes.flatMap((node, index) => {
    const last = index === nodes.length - 1;
    const marker =
      node.type === 'heading' ? '#' : node.status === 'completed' ? '✓' : node.status === 'canceled' ? '✕' : '▢';
    return [
      `${prefix}${last ? '└─' : '├─'} ${marker} ${node.title} [${node.id}]`,
      ...treeLines(node.children, `${prefix}${last ? '   ' : '│  '}`),
    ];
  });
}

function taskLines(task: TaskDetail, depth = 0): string[] {
  const indent = '  '.repeat(depth);
  return [
    `${indent}task: ${task.title} [${task.id}]`,
    `${indent}status: ${task.status} · location: ${task.location}`,
    ...(task.notes ? [`${indent}notes: ${task.notes}`] : []),
    ...attachmentLines(task.attachments, indent),
    ...task.children.flatMap((child) => taskLines(child, depth + 1)),
  ];
}

function projectLines(project: ProjectView): string[] {
  return [
    `project: ${project.title} [${project.id}]`,
    `status: ${project.status}${project.area ? ` · area: ${project.area}` : ''}`,
    ...(project.notes ? [`notes: ${project.notes}`] : []),
    ...attachmentLines(project.attachments),
    ...(project.children.length ? treeLines(project.children) : ['No visible tasks.']),
  ];
}

function headingLines(heading: HeadingView): string[] {
  return [
    `heading: ${heading.title} [${heading.id}]`,
    `location: ${heading.location}${heading.isArchived ? ' · archived' : ''}`,
    ...(heading.children.length ? treeLines(heading.children) : ['No visible tasks.']),
  ];
}

function areaLines(area: AreaView): string[] {
  return [
    `area: ${area.title} [${area.id}]`,
    ...(area.tags.length ? [`tags: ${area.tags.join(', ')}`] : []),
    ...(area.children.length
      ? area.children.map((project) => `  ▢ ${project.title} [${project.id}] · ${project.status}`)
      : ['No visible projects.']),
  ];
}

function viewLines(item: InspectView): string[] {
  switch (item.type) {
    case 'task':
      return taskLines(item);
    case 'project':
      return projectLines(item);
    case 'heading':
      return headingLines(item);
    case 'area':
      return areaLines(item);
  }
}

function renderItems(items: InspectView[]) {
  return <Text>{items.map((item) => viewLines(item).join('\n')).join('\n\n')}</Text>;
}

export class InspectCommand {
  static readonly meta: CommandMeta = {
    name: 'inspect',
    description: 'Show whatever an id names — task, project, heading, or area',
    options: [{ ...ID_OPTION, description: 'Stable item id of any type; use commas for several' }, ...FILTER_OPTIONS],
    view: renderItems,
  };

  static create(args: ParsedArgs): InspectCommand {
    return new InspectCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<InspectView[]> {
    const { model } = await loadInstanceContext(this.flags.instance);
    return withAttachments(
      model,
      inspectItems(model.toJSON(), parseIdsFlag(this.flags.id), {
        showFuture: this.flags['show-future'] ?? false,
        showCompleted: this.flags['show-completed'] ?? false,
      })
    );
  }
}
