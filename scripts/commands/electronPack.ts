import { build } from 'electron-builder';
import { promises as fs } from 'fs';
import path, { join } from 'path';
import { createTempBuildDir } from '../utils/createTempBuildDir.js';
import { loadElectronPackEnv } from '../utils/loadEnv.js';
import { resolveRoot } from '../utils/paths.js';
import { getDarwinArm64Config } from './electronPack/config/darwin-arm64.js';

export async function electronPackCommand() {
  try {
    console.log('[electron] Starting Electron packaging...');
    // Ensure electron-dist directory exists
    const electronDistPath = resolveRoot('electron-dist');
    try {
      await fs.access(electronDistPath);
    } catch {
      console.error('[electron] Error: electron-dist directory not found. Please run "npm run electron:build" first.');
      process.exit(1);
    }

    const tempDir = await createTempBuildDir();
    console.log(`[electron] Temporary build directory created at: ${tempDir}`);
    const loadEnvSuccess = await loadElectronPackEnv();
    if (!loadEnvSuccess) {
      console.error('[electron] Error: Failed to load environment variables from electronPackEnv.json');
      process.exit(1);
    }

    const tempOutputDir = await createTempBuildDir();

    const darwinArm64Config = getDarwinArm64Config({
      appDirectory: tempDir,
      outputDirectory: tempOutputDir,
      codeSign: false,
    });

    const buildResult = await build(darwinArm64Config);
    console.log('[electron] Build completed:', buildResult);

    // Copy build artifacts to release directory
    const releaseDir = resolveRoot('release');
    await fs.rm(releaseDir, { recursive: true });
    await fs.mkdir(releaseDir, { recursive: true });

    // Copy files from buildResult to release directory
    if (buildResult && Array.isArray(buildResult)) {
      for (const filePath of buildResult) {
        const fileName = path.basename(filePath);
        await fs.cp(filePath, join(releaseDir, fileName), { recursive: true });
        console.log(`[electron] Copied ${fileName} to release directory`);
      }
    }
  } catch (error) {
    console.error('[electron] Error packaging Electron app:', error);
    process.exit(1);
  }
}
