import { execSync } from 'child_process';

/**
 * Gets the latest version for a specific target from git tags
 * @param target - The target platform (e.g., 'darwin-arm64')
 * @returns The latest version string or null if no matching tags found
 */
export function getLatestVersionForTarget(target: string): string | null {
  try {
    // Get all tags from the current commit
    const tagsOutput = execSync('git tag --points-at HEAD', { encoding: 'utf-8' }).trim();

    if (!tagsOutput) {
      return null;
    }

    const tags = tagsOutput.split('\n').filter((tag) => tag.trim());
    const targetPrefix = `${target}-`;

    // Filter tags that start with the target prefix
    const targetTags = tags.filter((tag) => tag.startsWith(targetPrefix));

    if (targetTags.length === 0) {
      return null;
    }

    // Extract version numbers and find the highest one
    const versions = targetTags
      .map((tag) => {
        const versionPart = tag.substring(targetPrefix.length);
        const match = versionPart.match(/^(\d+)\.(\d+)\.(\d+)$/);
        if (!match) {
          return null;
        }
        return {
          original: versionPart,
          major: parseInt(match[1], 10),
          minor: parseInt(match[2], 10),
          patch: parseInt(match[3], 10),
        };
      })
      .filter((version): version is NonNullable<typeof version> => version !== null);

    if (versions.length === 0) {
      return null;
    }

    // Sort versions and get the highest one
    versions.sort((a, b) => {
      if (a.major !== b.major) return b.major - a.major;
      if (a.minor !== b.minor) return b.minor - a.minor;
      return b.patch - a.patch;
    });

    return versions[0].original;
  } catch (error) {
    console.warn(`[git] Warning: Failed to get git tags: ${error}`);
    return null;
  }
}
