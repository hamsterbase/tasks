import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const SKILL_NAME = 'hamsterbase-tasks';

/**
 * Directory of the agent skill shipped with this CLI. The published package
 * keeps it at `<package root>/skills/<name>`; a source checkout keeps it at
 * `tasks/skills/<name>`. Both are found by walking up from this module, so the
 * skill a caller reads always belongs to the CLI that printed the path.
 */
export async function resolveSkillDir(): Promise<string> {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (;;) {
    const candidate = path.join(dir, 'skills', SKILL_NAME);
    try {
      await fs.stat(path.join(candidate, 'SKILL.md'));
      return candidate;
    } catch {
      // not this level — keep walking up
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error('bundled skill not found\nreinstall with `npm install -g @hamsterbase/tasks-cli`');
    }
    dir = parent;
  }
}
