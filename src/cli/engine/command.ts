import type { ReactElement } from 'react';
import { CliOption, ParsedArgs } from './args';

export interface CliArg {
  name: string;
  required?: boolean;
}

/**
 * Options every command accepts. `--json` is a universal output mode handled
 * generically by the engine, so individual commands never declare it.
 */
export const GLOBAL_OPTIONS: CliOption[] = [{ name: 'json', description: 'Output machine-readable JSON' }];

/**
 * Everything the engine and the auto-generated help need to know about a
 * command. Each command class registers its own place in the hierarchy via
 * `path` (e.g. `['db', 'use']`); nothing about routing or help text lives
 * outside the command itself.
 */
export interface CommandMeta {
  /** Positional path that selects this command. */
  path: string[];
  description: string;
  /** Positional arguments accepted after `path`. */
  args?: CliArg[];
  /** Flags; an option with `arg` consumes the next token as its value. */
  options?: CliOption[];
  /** Pure renderer for this command's result. Declared with the command. */
  view: (result: never) => ReactElement;
}

export interface CommandResult {
  exec(): Promise<unknown>;
}

/** Shape every command class conforms to. */
export interface CommandClass {
  readonly meta: CommandMeta;
  create(args: ParsedArgs): CommandResult;
}

/** `<id>` for required args, `[id]` for optional ones. */
export function formatArgs(meta: CommandMeta): string {
  return (meta.args ?? []).map((a) => (a.required === false ? `[${a.name}]` : `<${a.name}>`)).join(' ');
}

/** Canonical invocation, e.g. `tasks db use <id>`. */
export function commandUsage(meta: CommandMeta): string {
  const args = formatArgs(meta);
  return `tasks ${meta.path.join(' ')}${args ? ` ${args}` : ''}`;
}

/** The positional value for a command's nth declared arg, if present. */
export function argValue(meta: CommandMeta, args: ParsedArgs, index: number): string | undefined {
  return args._[meta.path.length + index];
}
