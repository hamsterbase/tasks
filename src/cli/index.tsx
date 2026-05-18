#!/usr/bin/env tsx
import { cli } from './commands';
import { run } from './engine';

process.on('SIGINT', () => process.exit(130));

run(cli).catch((err) => {
  process.exitCode = 1;
  process.stderr.write(`✗ ${(err as Error).message}\n`);
});
