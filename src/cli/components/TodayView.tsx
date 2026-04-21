import React, { useEffect, useState } from 'react';
import { Box, Text, useApp } from 'ink';
import { loadModel } from '../loadModel';
import { readConfig, pickDatabaseId } from '../config';
import { resolveDatabase, listDatabases } from '../databases';
import { getTodayTasks, formatDue, TodayTask } from '../today';
import { Column, TaskTable } from './TaskTable';

interface Props {
  dbFlag?: string;
  json?: boolean;
}

type Row = TodayTask & { shortId: number };

type State =
  | { kind: 'loading' }
  | { kind: 'ok'; rows: Row[] }
  | { kind: 'error'; message: string };

export function TodayView({ dbFlag, json }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    (async () => {
      try {
        const [dbs, config] = await Promise.all([listDatabases(), readConfig()]);
        const targetId = dbFlag ?? pickDatabaseId(undefined, config);
        const resolved = dbFlag ? resolveDatabase(dbFlag, dbs) : dbs.find((d) => d.id === targetId);
        if (!resolved || 'error' in (resolved as object)) {
          const msg = resolved && 'error' in (resolved as object) ? (resolved as { error: string }).error : `database "${targetId}" not found`;
          setState({ kind: 'error', message: msg });
          process.exitCode = 1;
          return;
        }
        const dbId = 'id' in (resolved as object) ? (resolved as { id: string }).id : targetId;
        const model = await loadModel(dbId);
        const tasks = getTodayTasks(model);
        const rows: Row[] = tasks.map((t, i) => ({ ...t, shortId: i + 1 }));

        if (json) {
          process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
        }
        setState({ kind: 'ok', rows });
      } catch (err) {
        setState({ kind: 'error', message: (err as Error).message });
        process.exitCode = 1;
      } finally {
        exit();
      }
    })();
  }, [exit, dbFlag, json]);

  if (json) return null;
  if (state.kind === 'loading') return <Text dimColor>Loading…</Text>;
  if (state.kind === 'error') return <Text color="red">✗ {state.message}</Text>;
  if (state.rows.length === 0) return <Text dimColor>No tasks for today.</Text>;

  const columns: Column<Row>[] = [
    {
      header: 'ID',
      value: (r) => String(r.shortId),
      render: (r) => <Text dimColor>{r.shortId}</Text>,
    },
    {
      header: '',
      width: 1,
      value: () => '▢',
      render: () => <Text>▢</Text>,
    },
    {
      header: 'TITLE',
      value: (r) => r.title,
      render: (r) => <Text>{r.title}</Text>,
    },
    {
      header: 'PROJECT',
      value: (r) => r.projectTitle,
      render: (r) => <Text dimColor>{r.projectTitle}</Text>,
    },
    {
      header: 'DUE',
      value: (r) => formatDue(r),
      render: (r) => {
        const label = formatDue(r);
        if (r.isOverdue) return <Text color="red">{label}</Text>;
        if (label === 'today') return <Text color="yellow">{label}</Text>;
        return <Text dimColor>{label}</Text>;
      },
    },
    {
      header: 'TAGS',
      value: (r) => r.tags.map((t) => `#${t}`).join(' '),
      render: (r) => <Text color="magenta">{r.tags.map((t) => `#${t}`).join(' ')}</Text>,
    },
  ];

  return (
    <Box flexDirection="column">
      <TaskTable rows={state.rows} columns={columns} empty="No tasks for today." />
    </Box>
  );
}
