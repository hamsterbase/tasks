#!/usr/bin/env tsx
import { cac } from 'cac';
import { webDevCommand } from './commands/webDev';
import { webBuildCommand } from './commands/webBuild';
import { electronDevCommand } from './commands/electronDev';
import { electronBuildCommand } from './commands/electronBuild';
import { electronPackCommand } from './commands/electronPack';
import { dockerBuildCommand } from './commands/dockerBuild';
import { debugServerCommand } from './commands/debugServer';

// Handle termination
process.on('SIGINT', () => {
  process.exit();
});

// Main entry point
const cli = cac('tasks');

cli
  .command('webDev', 'Start development server')
  .option('--host [host]', 'Specify host (default: localhost, use --host without value for 0.0.0.0)')
  .action(async (options) => {
    await webDevCommand(options);
  });

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
  .option('-t, --target <target>', 'Target platform (required)')
  .action(async (options) => {
    await electronPackCommand(options);
  });

cli
  .command('dockerBuild', 'Build Docker image')
  .option('--tag <tag>', 'Docker image tag')
  .option('--platform <platform>', 'Target platform (default: linux/amd64)')
  .option('--release', 'Enable release mode')
  .action(async (options) => {
    await dockerBuildCommand(options);
  });

cli
  .command('debugServer', 'Start debug server')
  .option('--port <port>', 'Server port (default: 3000)')
  .action((options) => {
    debugServerCommand(options);
  });

cli.help();
cli.version('1.0.0');

cli.parse();
