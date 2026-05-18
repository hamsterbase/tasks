import React from 'react';
import { Box, Text } from 'ink';
import { formatDue } from '../core/today';
import { TodayRow } from '../commands/today/TodayCommand';
import { Column, TaskTable } from './TaskTable';

export function TodayView({ rows }: { rows: TodayRow[] }) {
  if (rows.length === 0) return <Text dimColor>No tasks for today.</Text>;

  const columns: Column<TodayRow>[] = [
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
      <TaskTable rows={rows} columns={columns} empty="No tasks for today." />
    </Box>
  );
}
