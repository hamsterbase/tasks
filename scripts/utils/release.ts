import fs from 'fs';
import path from 'path';
import { getCurrentCommitHash } from './git.js';

export interface ReleaseConfig {
  buildOption: unknown;
  commitHash: string;
}

export function generateReleaseConfig(buildOption: unknown, outputDir: string): void {
  const releaseConfig: ReleaseConfig = {
    buildOption,
    commitHash: getCurrentCommitHash(),
  };

  const configPath = path.join(outputDir, 'release_config.json');
  fs.writeFileSync(configPath, JSON.stringify(releaseConfig, null, 2));

  console.log(`[release] Generated release_config.json at ${configPath}`);
}

export function validateReleaseConfigs(distPath: string, electronDistPath: string): void {
  const distConfigPath = path.join(distPath, 'release_config.json');
  const electronDistConfigPath = path.join(electronDistPath, 'release_config.json');

  if (!fs.existsSync(distConfigPath)) {
    throw new Error(
      `[release] Error: release_config.json not found in ${distPath}. Please run webBuild with --release first.`
    );
  }

  if (!fs.existsSync(electronDistConfigPath)) {
    throw new Error(
      `[release] Error: release_config.json not found in ${electronDistPath}. Please run electronBuild with --release first.`
    );
  }

  const distConfig: ReleaseConfig = JSON.parse(fs.readFileSync(distConfigPath, 'utf8'));
  const electronDistConfig: ReleaseConfig = JSON.parse(fs.readFileSync(electronDistConfigPath, 'utf8'));
  const currentCommitHash = getCurrentCommitHash();

  if (distConfig.commitHash !== electronDistConfig.commitHash) {
    throw new Error(
      `[release] Error: Commit hash mismatch. dist: ${distConfig.commitHash}, electron-dist: ${electronDistConfig.commitHash}`
    );
  }

  if (distConfig.commitHash !== currentCommitHash) {
    throw new Error(
      `[release] Error: Build commit hash mismatch with current commit. Build: ${distConfig.commitHash}, Current: ${currentCommitHash}`
    );
  }

  const expectedDistBuildOption = {
    '--': [],
    useRelativeBase: true,
    release: true,
  };

  const expectedElectronDistBuildOption = {
    '--': [],
    release: true,
  };

  if (JSON.stringify(distConfig.buildOption) !== JSON.stringify(expectedDistBuildOption)) {
    throw new Error(
      `[release] Error: Invalid build options in dist. Expected: ${JSON.stringify(expectedDistBuildOption)}, Got: ${JSON.stringify(distConfig.buildOption)}`
    );
  }

  if (JSON.stringify(electronDistConfig.buildOption) !== JSON.stringify(expectedElectronDistBuildOption)) {
    throw new Error(
      `[release] Error: Invalid build options in electron-dist. Expected: ${JSON.stringify(expectedElectronDistBuildOption)}, Got: ${JSON.stringify(electronDistConfig.buildOption)}`
    );
  }

  console.log('[release] Release config validation passed');
  console.log(`[release] Commit hash: ${distConfig.commitHash}`);
}
