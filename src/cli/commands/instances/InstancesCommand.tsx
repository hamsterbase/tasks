import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { CliInstanceInfo } from '../../../base/common/cliApproval/protocol';
import { listInstances } from '../../core/approval';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z.object({}).strict();

function renderInstances(rows: CliInstanceInfo[]) {
  if (rows.length === 0) {
    return <Text dimColor>No running HamsterBase Tasks app.</Text>;
  }
  return (
    <Text>
      {[
        'INSTANCE\tPID\tDATABASE',
        ...rows.map((row) => `${row.instanceId}\t${row.pid}\t${row.databaseId || 'unknown'}`),
      ].join('\n')}
    </Text>
  );
}

export class InstancesCommand {
  static readonly meta: CommandMeta = {
    name: 'instances',
    description: 'List running HamsterBase Tasks apps and their open databases',
    view: renderInstances,
  };

  static create(args: ParsedArgs): InstancesCommand {
    parseCommandFlags(args, flagsSchema);
    return new InstancesCommand();
  }

  async exec(): Promise<CliInstanceInfo[]> {
    return listInstances();
  }
}
