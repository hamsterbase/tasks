import { buildDocker } from '../utils/buildDocker.js';
import { getLatestVersionForTarget } from '../utils/getLatestVersionForTarget.js';
import { checkUncommittedChanges } from '../utils/git.js';

interface DockerBuildOptions {
  platform?: string;
  release?: boolean;
}

export async function dockerBuildCommand(options: DockerBuildOptions = {}): Promise<void> {
  try {
    console.log('[docker] Starting Docker build process...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    let tag = `hamsterbase/tasks-dev:debug-${timestamp}`;
    const platform = 'linux/amd64';
    const { release = false } = options;

    if (release) {
      console.log('[docker] Release mode enabled');

      if (checkUncommittedChanges()) {
        console.error(
          '[docker] Error: Uncommitted changes detected. Please commit all changes before building in release mode.'
        );
        process.exit(1);
      }
      const latestTag = getLatestVersionForTarget('docker-amd64');
      if (!latestTag) {
        console.error('[docker] Error: Unable to fetch the latest version tag for docker-amd64.');
        process.exit(1);
      }
      tag = `hamsterbase/tasks:${latestTag}`;
      console.log('[docker] Working directory is clean');
    }

    console.log(`[docker] Building with tag: ${tag}`);
    console.log(`[docker] Target platform: ${platform}`);

    await buildDocker({
      tag,
      platform,
      release,
    });

    console.log('[docker] Docker build completed successfully!');
    console.log(`[docker] Image tagged as: ${tag}`);
  } catch (error) {
    console.error('[docker] Build failed:', error);
    process.exit(1);
  }
}
