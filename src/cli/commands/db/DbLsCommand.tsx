import React from 'react';
import { IDatabaseMeta } from '../../../services/database/common/database';
import { CommandMeta } from '../../engine';
import { DbListView } from '../../components/DbListView';
import { pickDatabaseId, readConfig } from '../../core/config';
import { countTaskFiles, listDatabases } from '../../core/databases';

export interface DbLsRow {
  id: string;
  name: string;
  taskCount: number;
  isCurrent: boolean;
}

export class DbLsCommand {
  static readonly meta: CommandMeta = {
    path: ['db', 'ls'],
    description: 'List all databases',
    view: (rows: DbLsRow[]) => <DbListView rows={rows} />,
  };

  static create(): DbLsCommand {
    return new DbLsCommand();
  }

  async exec(): Promise<DbLsRow[]> {
    const [dbs, config] = await Promise.all([listDatabases(), readConfig()]);
    const currentId = pickDatabaseId(undefined, config, dbs);
    return Promise.all(
      dbs.map(async (d: IDatabaseMeta) => ({
        id: d.id,
        name: d.name,
        taskCount: await countTaskFiles(d.id),
        isCurrent: d.id === currentId,
      }))
    );
  }
}
