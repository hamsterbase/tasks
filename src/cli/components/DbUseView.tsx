import React, { useEffect, useState } from 'react';
import { Box, Text, useApp } from 'ink';
import { listDatabases, resolveDatabase } from '../databases';
import { readConfig, writeConfig } from '../config';
import { IDatabaseMeta } from '../../services/database/common/database';

interface Props {
  target: string;
}

type State =
  | { kind: 'loading' }
  | { kind: 'ok'; meta: IDatabaseMeta }
  | { kind: 'error'; message: string; candidates?: IDatabaseMeta[] };

export function DbUseView({ target }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    (async () => {
      try {
        const dbs = await listDatabases();
        const resolved = resolveDatabase(target, dbs);
        if ('error' in resolved) {
          setState({ kind: 'error', message: resolved.error, candidates: resolved.candidates });
          process.exitCode = 1;
          return;
        }
        const config = await readConfig();
        await writeConfig({ ...config, currentDatabase: resolved.id });
        setState({ kind: 'ok', meta: resolved });
      } catch (err) {
        setState({ kind: 'error', message: (err as Error).message });
        process.exitCode = 1;
      } finally {
        exit();
      }
    })();
  }, [exit, target]);

  if (state.kind === 'loading') return <Text dimColor>Loading…</Text>;
  if (state.kind === 'ok') {
    return (
      <Text>
        <Text color="green">✓</Text> default database → {state.meta.name}
      </Text>
    );
  }
  return (
    <Box flexDirection="column">
      <Text color="red">✗ {state.message}</Text>
      {state.candidates && state.candidates.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {state.candidates.map((c) => (
            <Text key={c.id}>
              <Text dimColor>  </Text>
              <Text>{c.id}</Text>
              <Text dimColor>  </Text>
              <Text dimColor>{c.name}</Text>
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
