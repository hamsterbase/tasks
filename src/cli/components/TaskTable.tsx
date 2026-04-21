import React from 'react';
import { Box, Text } from 'ink';
import stringWidth from 'string-width';

export interface Column<T> {
  header: string;
  width?: number;
  render: (row: T) => React.ReactNode;
  value: (row: T) => string;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  empty?: string;
}

export function TaskTable<T>({ rows, columns, empty }: Props<T>) {
  if (rows.length === 0) {
    return <Text dimColor>{empty ?? 'No results.'}</Text>;
  }

  const widths = columns.map((col) => {
    if (col.width) return col.width;
    const contentMax = Math.max(...rows.map((r) => stringWidth(col.value(r))));
    return Math.max(stringWidth(col.header), contentMax);
  });

  return (
    <Box flexDirection="column">
      <Box>
        {columns.map((col, i) => (
          <Box key={col.header} width={widths[i] + 2}>
            <Text bold color="cyan">
              {col.header}
            </Text>
          </Box>
        ))}
      </Box>
      {rows.map((row, idx) => (
        <Box key={idx}>
          {columns.map((col, i) => (
            <Box key={col.header} width={widths[i] + 2}>
              {col.render(row)}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}
