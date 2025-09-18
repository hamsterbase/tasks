import { buildDocker } from '../utils/buildDocker.js';
import { checkUncommittedChanges } from '../utils/git.js';

interface DockerBuildOptions {
  tag?: string;
  platform?: string;
  release?: boolean;
}

export async function dockerBuildCommand(options: DockerBuildOptions = {}): Promise<void> {
  try {
    console.log('[docker] Starting Docker build process...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const defaultTag = `hamsterbase/tasks:debug-${timestamp}`;
    const { tag = defaultTag, platform = 'linux/amd64', release = false } = options;

    if (release) {
      console.log('[docker] Release mode enabled');

      if (checkUncommittedChanges()) {
        console.error(
          '[docker] Error: Uncommitted changes detected. Please commit all changes before building in release mode.'
        );
        process.exit(1);
      }

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
