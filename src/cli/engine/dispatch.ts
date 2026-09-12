import type { ReactElement } from 'react';
import { CLI_VERSION } from '../core/version';
import { parseArgs, ParsedArgs } from './args';
import { CommandClass, CommandMeta, GLOBAL_OPTIONS } from './command';
import { runCommand } from './runCommand';
import { commandHelp, rootHelp } from './help';

/**
 * The single declarative description of the CLI: a list of command classes
 * plus the parsed argv. Everything else (routing, validation, JSON mode, help)
 * is derived from each command's own `meta`.
 */
export interface CliConfig {
  commands: CommandClass[];
  args: ParsedArgs;
  preflight?: Preflight;
}

/**
 * Runs after a command is matched and before it executes. The engine stays
 * command- and desktop-agnostic; the environment checks a command needs
 * (currently the app protocol version) are injected here.
 */
export type Preflight = (meta: CommandMeta, args: ParsedArgs) => Promise<void>;

/** Builds the config: derives value flags from command options, parses argv. */
export function defineCli(input: { commands: CommandClass[]; preflight?: Preflight }): CliConfig {
  const options = [...input.commands.flatMap((command) => command.meta.options ?? []), ...GLOBAL_OPTIONS];
  const valueFlags = new Set(options.filter((option) => option.arg).map((option) => option.name));
  const aliases = new Map(
    options.flatMap((option) => (option.aliases ?? []).map((alias) => [alias, option.name] as const))
  );
  return {
    commands: input.commands,
    args: parseArgs(process.argv.slice(2), valueFlags, aliases),
    preflight: input.preflight,
  };
}

export async function run({ commands, args, preflight }: CliConfig): Promise<void> {
  const metaList = commands.map((c) => c.meta);
  const [commandName, ...positionals] = args._;

  if (!commandName) {
    if (args.flags.version) {
      process.stdout.write(`${CLI_VERSION}\n`);
      return;
    }
    process.stdout.write(rootHelp(metaList));
    return;
  }

  const command = commands.find((candidate) => candidate.meta.name === commandName);
  if (!command) {
    process.stderr.write(`unknown command: ${commandName}\n`);
    process.exitCode = 1;
    return;
  }

  const { meta } = command;
  if (args.help) {
    process.stdout.write(commandHelp(meta));
    return;
  }

  const options = meta.options ?? [];
  const allowed = new Set([...options.map((option) => option.name), ...GLOBAL_OPTIONS.map((option) => option.name)]);
  const unknown = Object.keys(args.flags).find((name) => !allowed.has(name));
  if (unknown) {
    process.stderr.write(`${meta.name}: unknown option --${unknown}\n`);
    process.exitCode = 1;
    return;
  }

  if (positionals.length > 0) {
    process.stderr.write(`unexpected positional argument: ${positionals[0]}\n`);
    process.exitCode = 1;
    return;
  }

  if (preflight) {
    await preflight(meta, args);
  }

  return runCommand(() => command.create(args).exec(), meta.view as (result: unknown) => ReactElement, {
    json: Boolean(args.flags.json),
  });
}
