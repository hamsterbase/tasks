import React from 'react';
import { IDatabaseMeta } from '../../../services/database/common/database';
import { CommandMeta } from '../../engine';
import { DbCurrentView } from '../../components/DbCurrentView';
import { pickDatabaseId, readConfig } from '../../core/config';
import { listDatabases } from '../../core/databases';

export class DbCurrentCommand {
  static readonly meta: CommandMeta = {
    path: ['db', 'current'],
    description: 'Show the current database',
    view: (meta: IDatabaseMeta) => <DbCurrentView meta={meta} />,
  };

  static create(): DbCurrentCommand {
    return new DbCurrentCommand();
  }

  async exec(): Promise<IDatabaseMeta> {
    const [dbs, config] = await Promise.all([listDatabases(), readConfig()]);
    const currentId = pickDatabaseId(undefined, config, dbs);
    const found = dbs.find((d) => d.id === currentId);
    if (!found) throw new Error(`current database "${currentId}" not found locally`);
    return found;
  }
}
