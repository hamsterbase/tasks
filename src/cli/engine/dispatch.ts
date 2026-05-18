import type { ReactElement } from 'react';
import { parseArgs, ParsedArgs } from './args';
import { CommandClass, argValue } from './command';
import { runCommand } from './runCommand';
import { commandHelp, groupHelp, rootHelp } from './help';

/**
 * The single declarative description of the CLI: a list of command classes
 * plus the parsed argv. Everything else (routing, validation, JSON mode, help)
 * is derived from each command's own `meta`.
 */
export interface CliConfig {
  commands: CommandClass[];
  args: ParsedArgs;
}

/** Builds the config: derives value flags from command options, parses argv. */
export function defineCli(input: { commands: CommandClass[] }): CliConfig {
  const valueFlags = new Set(
    input.commands.flatMap((c) => (c.meta.options ?? []).filter((o) => o.arg).map((o) => o.name))
  );
  return { commands: input.commands, args: parseArgs(process.argv.slice(2), valueFlags) };
}

function matchCommand(commands: CommandClass[], positionals: string[]): CommandClass | undefined {
  return commands
    .filter((c) => c.meta.path.length <= positionals.length && c.meta.path.every((p, i) => positionals[i] === p))
    .sort((a, b) => b.meta.path.length - a.meta.path.length)[0];
}

export async function run({ commands, args }: CliConfig): Promise<void> {
  const metaList = commands.map((c) => c.meta);
  const [command, action] = args._;

  if (!command) {
    process.stdout.write(rootHelp(metaList));
    return;
  }

  const cmd = matchCommand(commands, args._);
  if (cmd) {
    const { meta } = cmd;
    if (args.help) {
      process.stdout.write(commandHelp(meta));
      return;
    }
    const missing = (meta.args ?? []).find((a, i) => a.required !== false && argValue(meta, args, i) === undefined);
    if (missing) {
      process.stderr.write(`${meta.path.join(' ')} requires <${missing.name}>\n`);
      process.exitCode = 1;
      return;
    }
    return runCommand(() => cmd.create(args).exec(), meta.view as (result: unknown) => ReactElement, {
      json: Boolean(args.flags.json),
    });
  }

  // No exact command. If it names a known group, show that group's help
  // (also for an explicit `--help`); otherwise it's an error.
  const isGroup = metaList.some((m) => m.path.length > 1 && m.path[0] === command);
  if (isGroup && (args.help || !action)) {
    process.stdout.write(groupHelp(command, metaList));
    return;
  }
  process.stderr.write(isGroup ? `unknown ${command} action: ${action}\n` : `unknown command: ${command}\n`);
  process.exitCode = 1;
}
