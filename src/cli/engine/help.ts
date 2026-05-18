import { CliOption } from './args';
import { CommandMeta, commandUsage, formatArgs, GLOBAL_OPTIONS } from './command';

/**
 * Help is fully derived from {@link CommandMeta}. There are no per-command
 * help functions: add a command, register its meta, and its help, examples,
 * and listings all appear automatically.
 */

const HELP_FLAG = `  ${'-h, --help'.padEnd(14)}Display this message`;

function optionLine(opt: CliOption): string {
  const flag = `--${opt.name}${opt.arg ? ` ${opt.arg}` : ''}`;
  return `  ${flag.padEnd(14)}${opt.description}`;
}

function optionExample(base: string, opt: CliOption): string {
  return `${base} --${opt.name}${opt.arg ? ` ${opt.arg}` : ''}`;
}

/** `tasks <path> <args>`, then one variant per command and global option. */
function autoExamples(meta: CommandMeta): string[] {
  const base = commandUsage(meta);
  return [
    base,
    ...(meta.options ?? []).map((o) => optionExample(base, o)),
    ...GLOBAL_OPTIONS.map((o) => optionExample(base, o)),
  ];
}

export function commandHelp(meta: CommandMeta): string {
  // Global options (e.g. --json) apply to every command, so list them too.
  const opts = [...(meta.options ?? []), ...GLOBAL_OPTIONS];
  return [
    `tasks ${meta.path.join(' ')} — ${meta.description}`,
    '',
    'Usage:',
    `  $ ${commandUsage(meta)} [options]`,
    '',
    'Options:',
    ...opts.map(optionLine),
    HELP_FLAG,
    '',
    'Examples:',
    ...autoExamples(meta).map((e) => `  $ ${e}`),
    '',
  ].join('\n');
}

function table(metaList: CommandMeta[]): string[] {
  const left = metaList.map((m) => m.path.join(' ') + (formatArgs(m) ? ` ${formatArgs(m)}` : ''));
  const w = Math.max(...left.map((l) => l.length));
  return metaList.map((m, i) => `  ${left[i].padEnd(w)}  ${m.description}`);
}

/** Help for a group prefix (e.g. `tasks db`): lists its child commands. */
export function groupHelp(prefix: string, metaList: CommandMeta[]): string {
  const children = metaList.filter((m) => m.path[0] === prefix);
  return [
    `tasks ${prefix} — ${prefix} commands`,
    '',
    'Commands:',
    ...table(children),
    '',
    'Examples:',
    ...children.flatMap(autoExamples).map((e) => `  $ ${e}`),
    '',
  ].join('\n');
}

export function rootHelp(metaList: CommandMeta[]): string {
  return [
    'tasks',
    '',
    'Usage:',
    '  $ tasks <command> [options]',
    '',
    'Commands:',
    ...table(metaList),
    '',
    'Run `tasks <command> --help` for command details.',
    '',
  ].join('\n');
}
