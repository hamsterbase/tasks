import { execSync } from 'child_process';

export function checkUncommittedChanges(): boolean {
  try {
    const result = execSync('git status --porcelain', {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return result.trim().length > 0;
  } catch {
    throw new Error('Failed to check git status. Make sure you are in a git repository.');
  }
}

export function getCurrentCommitHash(): string {
  try {
    const result = execSync('git rev-parse HEAD', {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return result.trim();
  } catch {
    throw new Error('Failed to get current commit hash.');
  }
}
