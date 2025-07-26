import { build } from 'electron-builder';
import { promises as fs } from 'fs';
import path, { join } from 'path';
import { createTempBuildDir } from '../utils/createTempBuildDir.js';
import { loadElectronPackEnv } from '../utils/loadEnv.js';
import { resolveRoot } from '../utils/paths.js';
import { getDarwinArm64Config } from './electronPack/config/darwin-arm64.js';
import { checkUncommittedChanges } from '../utils/git.js';
import { validateReleaseConfigs } from '../utils/release.js';
import { createTempDir } from '../utils/createTempDir.js';

interface ElectronPackOptions {
  release?: boolean;
  target: string;
}

const SUPPORTED_TARGETS = ['darwin-arm64'] as const;
type SupportedTarget = (typeof SUPPORTED_TARGETS)[number];

const targetConfigMap = {
  'darwin-arm64': getDarwinArm64Config,
} as const;

export async function electronPackCommand(options: ElectronPackOptions) {
  try {
    console.log('[electron] Starting Electron packaging...');

    // Validate target parameter
    if (!options.target) {
      console.error('[electron] Error: Target parameter is required');
      process.exit(1);
    }

    if (!SUPPORTED_TARGETS.includes(options.target as SupportedTarget)) {
      console.error(
        `[electron] Error: Invalid target '${options.target}'. Supported targets: ${SUPPORTED_TARGETS.join(', ')}`
      );
      process.exit(1);
    }

    const target = options.target as SupportedTarget;
    console.log(`[electron] Packaging for target: ${target}`);

    if (options.release) {
      console.log('[release] Release mode enabled');

      if (checkUncommittedChanges()) {
        console.error(
          '[release] Error: Uncommitted changes detected. Please commit all changes before packaging in release mode.'
        );
        process.exit(1);
      }

      console.log('[release] Working directory is clean');

      const distPath = resolveRoot('dist');
      const electronDistPath = resolveRoot('electron-dist');

      validateReleaseConfigs(distPath, electronDistPath);

      const loadEnvSuccess = await loadElectronPackEnv();
      if (!loadEnvSuccess) {
        console.error('[electron] Error: Failed to load environment variables from electronPackEnv.json');
        process.exit(1);
      }
    }

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
    const tempOutputDir = await createTempDir();

    const getConfig = targetConfigMap[target];
    if (!getConfig) {
      console.error(`[electron] Error: No configuration found for target '${target}'`);
      process.exit(1);
    }

    const configResult = getConfig({
      appDirectory: tempDir,
      outputDirectory: tempOutputDir,
      codeSign: !!options.release,
    });

    const buildResult = await build(configResult);
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
