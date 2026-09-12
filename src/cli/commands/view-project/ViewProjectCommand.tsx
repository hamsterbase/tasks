import { withAttachments, attachmentLines } from '../../core/attachments';
import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { loadInstanceContext } from '../../core/approval';
import { FILTER_OPTIONS, ID_OPTION } from '../../core/commandOptions';
import { idSchema, visibilitySchema } from '../../core/commandSchemas';
import { getProjectView, ProjectTreeNode, ProjectView } from '../../core/items';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z.object({ id: idSchema, ...visibilitySchema }).strict();
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

function renderProject(project: ProjectView) {
  const lines = [
    `${project.title} [${project.id}]`,
    `status: ${project.status}${project.area ? ` · area: ${project.area}` : ''}`,
    ...attachmentLines(project.attachments),
    ...treeLines(project.children),
  ];
  if (project.children.length === 0) {
    lines.push('No visible tasks.');
  }
  return <Text>{lines.join('\n')}</Text>;
}

export class ViewProjectCommand {
  static readonly meta: CommandMeta = {
    name: 'view-project',
    description: 'Show project details and tasks as a file tree',
    options: [ID_OPTION, ...FILTER_OPTIONS],
    view: renderProject,
  };

  static create(args: ParsedArgs): ViewProjectCommand {
    return new ViewProjectCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<ProjectView> {
    const { model } = await loadInstanceContext(this.flags.instance);
    return withAttachments(model, [
      getProjectView(model.toJSON(), this.flags.id, {
        showFuture: this.flags['show-future'] ?? false,
        showCompleted: this.flags['show-completed'] ?? false,
      }),
    ])[0];
  }
}
