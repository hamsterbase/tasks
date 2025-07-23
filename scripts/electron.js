#!/usr/bin/env node
import { spawn } from 'child_process';
import { createServer } from 'vite';
import electron from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { watch } from 'fs';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const command = process.argv[2];

async function compileElectron() {
  return new Promise((resolve, reject) => {
    spawn('npx', ['tsc', '-p', 'tsconfig.electron.json'], {
      stdio: 'inherit',
      shell: true,
    }).on('exit', (code) => {
      if (code === 0) {
        // Copy preload.js file
        const srcPreload = path.join(__dirname, '../src/electron/preload.js');
        const distPreload = path.join(__dirname, '../dist/electron/preload.js');

        try {
          fs.copyFileSync(srcPreload, distPreload);
          console.log('[electron] Copied preload.js');
          resolve();
        } catch (err) {
          console.error('[electron] Failed to copy preload.js:', err);
          reject(err);
        }
      } else {
        reject(new Error('TypeScript compilation failed'));
      }
    });
  });
}

async function runDev() {
  let electronProcess = null;
  let electronRestartLock = false;

  async function startVite() {
    const server = await createServer({
      configFile: path.join(__dirname, '../vite.config.ts'),
    });

    await server.listen();
    server.printUrls();

    return server;
  }

  function startElectron() {
    if (electronRestartLock) {
      return;
    }

    electronRestartLock = true;

    if (electronProcess) {
      electronProcess.kill();
    }

    electronProcess = spawn(electron, ['--enable-logging', path.join(__dirname, '../dist/electron/main.js')], {
      env: { ...process.env, NODE_ENV: 'development' },
      stdio: 'inherit',
    });

    electronProcess.on('exit', () => {
      electronRestartLock = false;
      electronProcess = null;

      if (!process.env.ELECTRON_STOP_ON_CLOSE) {
        process.exit();
      }
    });
  }

  function watchElectronFiles() {
    const electronPath = path.join(__dirname, '../src/electron');

    watch(electronPath, { recursive: true }, (_, filename) => {
      if (filename && (filename.endsWith('.ts') || filename.endsWith('.js'))) {
        console.log(`\n[electron] Detected change in ${filename}, recompiling...`);

        compileElectron()
          .then(() => {
            console.log('[electron] Recompilation successful, restarting...');
            startElectron();
          })
          .catch((err) => {
            console.error('[electron] Recompilation failed:', err);
          });
      }
    });
  }

  try {
    // Start Vite dev server
    console.log('[vite] Starting development server...');
    await startVite();

    // Initial TypeScript compilation
    console.log('\n[electron] Compiling TypeScript files...');
    await compileElectron();

    // Start Electron
    console.log('[electron] Starting Electron...\n');
    startElectron();

    // Watch for changes
    watchElectronFiles();
  } catch (error) {
    console.error('Error starting development server:', error);
    process.exit(1);
  }
}

async function runMain() {
  try {
    // Compile TypeScript
    console.log('[electron] Compiling TypeScript files...');
    await compileElectron();

    console.log('[electron] Starting Electron...');

    // Start Electron
    const electronProcess = spawn(electron, [path.join(__dirname, '../dist/electron/main.js')], {
      stdio: 'inherit',
    });

    electronProcess.on('exit', (code) => {
      process.exit(code);
    });
  } catch (error) {
    console.error('[electron] Error:', error);
    process.exit(1);
  }
}

// Handle termination
process.on('SIGINT', () => {
  process.exit();
});

// Main entry point
switch (command) {
  case 'dev':
    runDev();
    break;
  case 'main':
    runMain();
    break;
  default:
    console.error('Usage: node scripts/electron.js [dev|main]');
    process.exit(1);
}
