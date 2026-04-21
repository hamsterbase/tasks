#!/usr/bin/env tsx
import React from 'react';
import { cac } from 'cac';
import { render } from 'ink';
import { TodayView } from './components/TodayView';
import { DbListView } from './components/DbListView';
import { DbUseView } from './components/DbUseView';
import { DbCurrentView } from './components/DbCurrentView';

process.on('SIGINT', () => process.exit(130));

const cli = cac('tasks');

cli.option('--db <id>', 'Override default database (exact id or prefix)');
cli.option('--json', 'Output machine-readable JSON');

cli
  .command('today', "Show today's tasks")
  .action(async (options) => {
    const { waitUntilExit } = render(<TodayView dbFlag={options.db} json={options.json} />);
    await waitUntilExit();
  });

cli
  .command('db <action> [target]', 'Manage databases: ls | use <id> | current')
  .action(async (action: string, target: string | undefined) => {
    switch (action) {
      case 'ls': {
        const { waitUntilExit } = render(<DbListView />);
        await waitUntilExit();
        return;
      }
      case 'current': {
        const { waitUntilExit } = render(<DbCurrentView />);
        await waitUntilExit();
        return;
      }
      case 'use': {
        if (!target) {
          process.stderr.write('db use requires a database id\n');
          process.exitCode = 1;
          return;
        }
        const { waitUntilExit } = render(<DbUseView target={target} />);
        await waitUntilExit();
        return;
      }
      default:
        process.stderr.write(`unknown db action: ${action}\n`);
        process.exitCode = 1;
    }
  });

cli.help();
cli.parse();
