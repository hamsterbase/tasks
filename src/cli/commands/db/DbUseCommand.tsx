import React from 'react';
import { IDatabaseMeta } from '../../../services/database/common/database';
import { CommandMeta, ParsedArgs, argValue } from '../../engine';
import { DbUseView } from '../../components/DbUseView';
import { readConfig, writeConfig } from '../../core/config';
import { listDatabases, resolveDatabase } from '../../core/databases';

export class DbUseCommand {
  static readonly meta: CommandMeta = {
    path: ['db', 'use'],
    description: 'Set the current database (exact id or prefix)',
    args: [{ name: 'id', required: true }],
    view: (meta: IDatabaseMeta) => <DbUseView meta={meta} />,
  };

  static create(args: ParsedArgs): DbUseCommand {
    return new DbUseCommand(argValue(DbUseCommand.meta, args, 0) ?? '');
  }

  private constructor(private readonly target: string) {}

  async exec(): Promise<IDatabaseMeta> {
    const dbs = await listDatabases();
    const resolved = resolveDatabase(this.target, dbs);
    if ('error' in resolved) {
      const lines = [resolved.error];
      for (const c of resolved.candidates ?? []) lines.push(`  ${c.id}  ${c.name}`);
      throw new Error(lines.join('\n'));
    }
    const config = await readConfig();
    await writeConfig({ ...config, currentDatabase: resolved.id });
    return resolved;
  }
}
