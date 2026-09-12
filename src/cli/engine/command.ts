import type { ReactElement } from 'react';
import { CliOption, ParsedArgs } from './args';

/**
 * Options every command accepts. `--json` is a universal output mode handled
 * generically by the engine, so individual commands never declare it.
 */
export const GLOBAL_OPTIONS: CliOption[] = [{ name: 'json', description: 'Output machine-readable JSON' }];

/** Executable name published as the `bin` of `@hamsterbase/tasks-cli`. */
export const CLI_NAME = 'hamsterbase-tasks';

/**
 * Everything the engine and the auto-generated help need to know about a
 * command. Commands deliberately have exactly one name: nested subcommands
 * are not part of this CLI.
 */
export interface CommandMeta {
  /** Top-level kebab-case command name. */
  name: string;
  description: string;
  /** Flags; an option with `arg` consumes the next token as its value. */
  options?: CliOption[];
  /**
   * Lowest desktop protocol version this command needs. Omit (meaning 1) unless
   * the command relies on a wire change the app must understand; the engine
   * then refuses to run it against an older app instead of failing obscurely.
   * See `CLI_PROTOCOL_VERSION` in `base/common/cliApproval/protocol.ts`.
   */
  minProtocolVersion?: number;
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

/** Canonical invocation, e.g. `hamsterbase-tasks add-task --title <text>`. */
export function commandUsage(meta: CommandMeta): string {
  const required = (meta.options ?? [])
    .filter((option) => option.required)
    .map((option) => `--${option.name}${option.arg ? ` ${option.arg}` : ''}`);
  return `${CLI_NAME} ${meta.name}${required.length > 0 ? ` ${required.join(' ')}` : ''}`;
}

/** Uses raw argv flags, before command schemas apply defaults or transforms. */
export function requiredProtocolVersion(meta: CommandMeta, args: ParsedArgs): number {
  return Math.max(
    meta.minProtocolVersion ?? 1,
    ...[...(meta.options ?? []), ...GLOBAL_OPTIONS]
      .filter((option) => Object.prototype.hasOwnProperty.call(args.flags, option.name))
      .map((option) => option.minProtocolVersion ?? 1)
  );
}
