import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { loadInstanceContext } from '../../core/approval';
import { FILTER_OPTIONS } from '../../core/commandOptions';
import { visibilitySchema } from '../../core/commandSchemas';
import { CliListItem, getTodayItems } from '../../core/items';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z.object(visibilitySchema).strict();
type Flags = z.output<typeof flagsSchema>;

function renderRows(rows: CliListItem[]) {
  if (rows.length === 0) {
    return <Text dimColor>No visible items for today.</Text>;
  }
  return (
    <Text>
      {[
        'TYPE\tID\tTITLE\tPARENT\tSTATUS\tSTART\tDUE',
        ...rows.map(
          (row) =>
            `${row.type}\t${row.id}\t${row.title}\t${row.parent}\t${row.status}\t${row.startDate ?? ''}\t${row.dueDate ?? ''}`
        ),
      ].join('\n')}
    </Text>
  );
}

export class TodayCommand {
  static readonly meta: CommandMeta = {
    name: 'today',
    description: "Show today's tasks and projects as a flat list",
    options: FILTER_OPTIONS,
    view: renderRows,
  };

  static create(args: ParsedArgs): TodayCommand {
    return new TodayCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<CliListItem[]> {
    const { model } = await loadInstanceContext(this.flags.instance);
    return getTodayItems(model.toJSON(), {
      showFuture: this.flags['show-future'] ?? false,
      showCompleted: this.flags['show-completed'] ?? false,
    });
  }
}
