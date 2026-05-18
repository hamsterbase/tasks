import React from 'react';
import { Box, Text } from 'ink';
import { DbLsRow } from '../commands/db/DbLsCommand';
import { Column, TaskTable } from './TaskTable';

export function DbListView({ rows }: { rows: DbLsRow[] }) {
  const columns: Column<DbLsRow>[] = [
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
