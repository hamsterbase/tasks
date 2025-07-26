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
