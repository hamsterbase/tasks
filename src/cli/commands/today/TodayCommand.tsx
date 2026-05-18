import React from 'react';
import { CommandMeta, ParsedArgs } from '../../engine';
import { loadModel } from '../../core/loadModel';
import { readConfig, pickDatabaseId } from '../../core/config';
import { resolveDatabase, listDatabases } from '../../core/databases';
import { getTodayTasks, TodayTask } from '../../core/today';
import { TodayView } from '../../components/TodayView';

export type TodayRow = TodayTask & { shortId: number };

export class TodayCommand {
  static readonly meta: CommandMeta = {
    path: ['today'],
    description: "Show today's tasks",
    options: [{ name: 'db', arg: '<id>', description: 'Override default database (exact id or prefix)' }],
    view: (rows: TodayRow[]) => <TodayView rows={rows} />,
  };

  static create(args: ParsedArgs): TodayCommand {
    return new TodayCommand(typeof args.flags.db === 'string' ? args.flags.db : undefined);
  }

  private constructor(private readonly dbFlag?: string) {}

  async exec(): Promise<TodayRow[]> {
    const [dbs, config] = await Promise.all([listDatabases(), readConfig()]);
    const targetId = this.dbFlag ?? pickDatabaseId(undefined, config, dbs);
    const resolved = this.dbFlag ? resolveDatabase(this.dbFlag, dbs) : dbs.find((d) => d.id === targetId);

    if (!resolved || 'error' in (resolved as object)) {
      const msg =
        resolved && 'error' in (resolved as object)
          ? (resolved as { error: string }).error
          : `database "${targetId}" not found`;
      throw new Error(msg);
    }

    const dbId = 'id' in (resolved as object) ? (resolved as { id: string }).id : targetId;
    const model = await loadModel(dbId);
    return getTodayTasks(model).map((t, i) => ({ ...t, shortId: i + 1 }));
  }
}
