import React from 'react';
import { Box, Text } from 'ink';

/**
 * Generic error renderer. Every command failure flows through here so views
 * never have to know about error states. Multi-line messages (e.g. a resolve
 * error followed by candidate ids) are printed line by line.
 */
export function ErrorView({ message }: { message: string }) {
  const lines = message.split('\n');
  return (
    <Box flexDirection="column">
      {lines.map((line, i) => (
        <Text key={i} color="red">
          {i === 0 ? `✗ ${line}` : line}
        </Text>
      ))}
    </Box>
  );
}
