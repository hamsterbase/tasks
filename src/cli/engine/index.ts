/**
 * The CLI engine: a generic, command-agnostic runtime. It knows how to parse
 * argv, match a command by its declared `path`, validate args, render results
 * (or JSON), and auto-generate help — all from each command's `meta`.
 *
 * Commands and views live outside this folder; the engine never references a
 * specific command.
 */
export { defineCli, run } from './dispatch';
export type { CliConfig } from './dispatch';
export { argValue, commandUsage, formatArgs, GLOBAL_OPTIONS } from './command';
export type { CommandClass, CommandMeta, CliArg } from './command';
export { parseArgs } from './args';
export type { CliOption, ParsedArgs } from './args';
