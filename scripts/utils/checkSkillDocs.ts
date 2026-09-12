import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { resolveRoot } from './paths.js';

const SKILL_DIR = 'skills/hamsterbase-tasks';
const SKILL_FILES = [`${SKILL_DIR}/SKILL.md`, `${SKILL_DIR}/references/cli.md`];

/** Engine-level flags that belong to no command. */
const ENGINE_FLAGS = ['help', 'version'];

/**
 * The skill ships inside the CLI package, so the pair a user installs must
 * describe one command surface. This asks the freshly built binary for its own
 * help — the same metas the engine dispatches on — and fails the build when the
 * docs drift: a command they never mention, a command that no longer exists, or
 * a flag that is not an option of any command.
 */
export async function checkSkillDocs(distEntry: string): Promise<void> {
  const commandNames = new Set(listCommands(distEntry));
  const optionNames = new Set([...ENGINE_FLAGS, ...[...commandNames].flatMap((name) => listOptions(distEntry, name))]);

  const documentedCommands = new Set<string>();
  const problems: string[] = [];

  for (const file of SKILL_FILES) {
    const content = await fs.readFile(resolveRoot(file), 'utf-8');

    for (const [, name] of content.matchAll(/[\s`]([a-z][a-z-]*[a-z])(?=[\s`])/g)) {
      if (commandNames.has(name)) documentedCommands.add(name);
    }

    for (const [, flag] of content.matchAll(/--([a-z][a-z-]*)/g)) {
      if (!optionNames.has(flag)) {
        problems.push(`${file} documents --${flag}, which is not an option of any command`);
      }
    }
  }

  for (const name of commandNames) {
    if (!documentedCommands.has(name)) {
      problems.push(`${SKILL_FILES[1]} never documents the "${name}" command`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`[cli] skill docs are out of sync with the CLI:\n  - ${[...new Set(problems)].join('\n  - ')}`);
  }
}

function runHelp(distEntry: string, args: string[]): string {
  return execFileSync(process.execPath, [distEntry, ...args], { encoding: 'utf-8' });
}

/** Root help lists every registered command, one indented `name  description` per line. */
function listCommands(distEntry: string): string[] {
  const help = runHelp(distEntry, []);
  const commandBlock = help.split('Commands:\n')[1]?.split('\n\n')[0] ?? '';
  return [...commandBlock.matchAll(/^ {2}([a-z][a-z-]*)/gm)].map(([, name]) => name);
}

/** Per-command help spells out every option, including aliases and examples. */
function listOptions(distEntry: string, command: string): string[] {
  const help = runHelp(distEntry, [command, '--help']);
  return [...help.matchAll(/--([a-z][a-z-]*)/g)].map(([, name]) => name);
}
