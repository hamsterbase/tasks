import React, { useEffect, useState } from 'react';
import { Box, Text, useApp } from 'ink';
import { IDatabaseMeta } from '../../services/database/common/database';
import { listDatabases, countTaskFiles } from '../databases';
import { readConfig, pickDatabaseId } from '../config';
import { Column, TaskTable } from './TaskTable';

interface Row {
  id: string;
  name: string;
  taskCount: number;
  isCurrent: boolean;
}

export function DbListView() {
  const { exit } = useApp();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [dbs, config] = await Promise.all([listDatabases(), readConfig()]);
        const currentId = pickDatabaseId(undefined, config);
        const withCounts: Row[] = await Promise.all(
          dbs.map(async (d: IDatabaseMeta) => ({
            id: d.id,
            name: d.name,
            taskCount: await countTaskFiles(d.id),
            isCurrent: d.id === currentId,
          }))
        );
        setRows(withCounts);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setTimeout(() => exit(), 0);
      }
    })();
  }, [exit]);

  if (error) return <Text color="red">✗ {error}</Text>;
  if (!rows) return <Text dimColor>Loading…</Text>;

  const columns: Column<Row>[] = [
    {
      header: ' ',
      width: 1,
      value: (r) => (r.isCurrent ? '*' : ' '),
      render: (r) => (r.isCurrent ? <Text color="green">*</Text> : <Text> </Text>),
    },
    {
      header: 'ID',
      value: (r) => r.id,
      render: (r) => <Text color={r.isCurrent ? 'green' : undefined}>{r.id}</Text>,
    },
    {
      header: 'NAME',
      value: (r) => r.name,
      render: (r) => <Text>{r.name}</Text>,
    },
    {
      header: 'TASKS',
      value: (r) => String(r.taskCount),
      render: (r) => <Text dimColor>{r.taskCount}</Text>,
    },
  ];

  return (
    <Box flexDirection="column">
      <TaskTable rows={rows} columns={columns} empty="No databases found." />
    </Box>
  );
}
