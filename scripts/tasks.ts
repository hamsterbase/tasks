#!/usr/bin/env tsx
import { cac } from 'cac';
import { webDevCommand } from './commands/webDev';
import { webBuildCommand } from './commands/webBuild';
import { electronDevCommand } from './commands/electronDev';
import { electronBuildCommand } from './commands/electronBuild';
import { electronPackCommand } from './commands/electronPack';

// Handle termination
process.on('SIGINT', () => {
  process.exit();
});

// Main entry point
const cli = cac('tasks');

cli.command('webDev', 'Start development server').action(webDevCommand);

cli
  .command('webBuild', 'Build Vite project')
  .option('--coverage', 'Enable coverage mode')
  .option('--use-relative-base', 'Use relative base path (./) instead of absolute (/)')
  .option('--release', 'Enable release mode')
  .action((options) => {
    webBuildCommand(options);
  });

cli.command('electronDev', 'Start Electron development server').action(electronDevCommand);

cli
  .command('electronBuild', 'Build Electron application')
  .option('--release', 'Enable release mode')
  .action((options) => {
    electronBuildCommand(options);
  });

cli
  .command('electronPack', 'Package Electron application')
  .option('--release', 'Enable release mode')
  .action(async (options) => {
    await electronPackCommand(options);
  });

cli.help();
cli.version('1.0.0');

cli.parse();
