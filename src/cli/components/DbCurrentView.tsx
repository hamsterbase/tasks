import React, { useEffect, useState } from 'react';
import { Box, Text, useApp } from 'ink';
import { listDatabases } from '../databases';
import { readConfig, pickDatabaseId } from '../config';
import { IDatabaseMeta } from '../../services/database/common/database';

export function DbCurrentView() {
  const { exit } = useApp();
  const [meta, setMeta] = useState<IDatabaseMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [dbs, config] = await Promise.all([listDatabases(), readConfig()]);
        const currentId = pickDatabaseId(undefined, config);
        const found = dbs.find((d) => d.id === currentId);
        if (!found) {
          setError(`current database "${currentId}" not found locally`);
        } else {
          setMeta(found);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        exit();
      }
    })();
  }, [exit]);

  if (error) return <Text color="red">✗ {error}</Text>;
  if (!meta) return <Text dimColor>Loading…</Text>;

  return (
    <Box>
      <Text color="green">{meta.id}</Text>
      <Text>  </Text>
      <Text>{meta.name}</Text>
    </Box>
  );
}
