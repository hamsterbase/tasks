import React from 'react';
import { Box, Text } from 'ink';
import { IDatabaseMeta } from '../../services/database/common/database';

export function DbCurrentView({ meta }: { meta: IDatabaseMeta }) {
  return (
    <Box>
      <Text color="green">{meta.id}</Text>
      <Text> </Text>
      <Text>{meta.name}</Text>
    </Box>
  );
}
