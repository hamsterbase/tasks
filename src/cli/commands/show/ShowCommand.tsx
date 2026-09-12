import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { loadInstanceContext } from '../../core/approval';
import { FILTER_OPTIONS } from '../../core/commandOptions';
import { visibilitySchema } from '../../core/commandSchemas';
import { CliListItem, getShowItems } from '../../core/items';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z.object(visibilitySchema).strict();
type Flags = z.output<typeof flagsSchema>;

function renderRows(rows: CliListItem[]) {
  if (rows.length === 0) {
    return <Text dimColor>No visible areas or projects.</Text>;
  }
  return (
    <Text>
      {[
        'TYPE\tID\tTITLE\tPARENT\tSTATUS',
        ...rows.map((row) => `${row.type}\t${row.id}\t${row.title}\t${row.parent}\t${row.status ?? ''}`),
      ].join('\n')}
    </Text>
  );
}

export class ShowCommand {
  static readonly meta: CommandMeta = {
    name: 'show',
    description: 'Show available areas and projects',
    options: FILTER_OPTIONS,
    view: renderRows,
  };

  static create(args: ParsedArgs): ShowCommand {
    return new ShowCommand(parseCommandFlags(args, flagsSchema));
  }

  private constructor(private readonly flags: Flags) {}

  async exec(): Promise<CliListItem[]> {
    const { model } = await loadInstanceContext(this.flags.instance);
    return getShowItems(model.toJSON(), {
      showFuture: this.flags['show-future'] ?? false,
      showCompleted: this.flags['show-completed'] ?? false,
    });
  }
}
