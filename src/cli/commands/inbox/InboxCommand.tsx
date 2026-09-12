import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { loadInstanceContext } from '../../core/approval';
import { FILTER_OPTIONS } from '../../core/commandOptions';
import { visibilitySchema } from '../../core/commandSchemas';
import { CliListItem, getInboxItems } from '../../core/items';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z.object(visibilitySchema).strict();
type Flags = z.output<typeof flagsSchema>;

function renderRows(rows: CliListItem[]) {
  if (rows.length === 0) {
    return <Text dimColor>No visible inbox tasks.</Text>;
  }
  return (
    <Text>
      {[
        'ID\tTITLE\tSTATUS\tSTART\tDUE\tTAGS',
        ...rows.map(
          (row) =>
            `${row.id}\t${row.title}\t${row.status}\t${row.startDate ?? ''}\t${row.dueDate ?? ''}\t${row.tags.join(',')}`
        ),
      ].join('\n')}
    </Text>
  );
}

export class InboxCommand {
  static readonly meta: CommandMeta = {
    name: 'inbox',
    description: 'Show inbox tasks',
    options: FILTER_OPTIONS,
    view: renderRows,
  };

  static create(args: ParsedArgs): InboxCommand {
    return new InboxCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<CliListItem[]> {
    const { model } = await loadInstanceContext(this.flags.instance);
    return getInboxItems(model.toJSON(), {
      showFuture: this.flags['show-future'] ?? false,
      showCompleted: this.flags['show-completed'] ?? false,
    });
  }
}
