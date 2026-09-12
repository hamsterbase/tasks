import { CliOption } from './args';
import { CLI_NAME, CommandMeta, commandUsage, GLOBAL_OPTIONS } from './command';

/**
 * Help is fully derived from {@link CommandMeta}. There are no per-command
 * help functions: add a command, register its meta, and its help, examples,
 * and listings all appear automatically.
 */

const HELP_OPTION = '-h, --help';

function optionFlag(opt: CliOption): string {
  const aliases = (opt.aliases ?? []).map((alias) => `--${alias}`).join(', ');
  return `--${opt.name}${opt.arg ? ` ${opt.arg}` : ''}${aliases ? ` (${aliases})` : ''}`;
}

function optionLine(opt: CliOption, width: number): string {
  return `  ${optionFlag(opt).padEnd(width)}  ${opt.description}`;
}

function optionExample(base: string, opt: CliOption): string {
  return `${base} --${opt.name}${opt.arg ? ` ${opt.arg}` : ''}`;
}

/** Canonical command invocation, then one variant per optional/global flag. */
function autoExamples(meta: CommandMeta): string[] {
  const base = commandUsage(meta);
  return [
    base,
    ...(meta.options ?? []).filter((option) => !option.required).map((option) => optionExample(base, option)),
    ...GLOBAL_OPTIONS.map((o) => optionExample(base, o)),
  ];
}

export function commandHelp(meta: CommandMeta): string {
  // Global options (e.g. --json) apply to every command, so list them too.
  const opts = [...(meta.options ?? []), ...GLOBAL_OPTIONS];
  const optionWidth = Math.max(28, HELP_OPTION.length, ...opts.map((option) => optionFlag(option).length));
  return [
    `${CLI_NAME} ${meta.name} — ${meta.description}`,
    '',
    'Usage:',
    `  $ ${commandUsage(meta)} [options]`,
    '',
    'Options:',
    ...opts.map((option) => optionLine(option, optionWidth)),
    `  ${HELP_OPTION.padEnd(optionWidth)}  Display this message`,
    '',
    'Examples:',
    ...autoExamples(meta).map((e) => `  $ ${e}`),
    '',
  ].join('\n');
}

function table(metaList: CommandMeta[]): string[] {
  const left = metaList.map((meta) => meta.name);
  const w = Math.max(...left.map((l) => l.length));
  return metaList.map((m, i) => `  ${left[i].padEnd(w)}  ${m.description}`);
}

export function rootHelp(metaList: CommandMeta[]): string {
  return [
    CLI_NAME,
    '',
    'Usage:',
    `  $ ${CLI_NAME} <command> [options]`,
    '',
    'Commands:',
    ...table(metaList),
    '',
    'Options:',
    '  --version  Print the CLI version',
    '  -h, --help  Display this message',
    '',
    `Run \`${CLI_NAME} <command> --help\` for command details.`,
    '',
  ].join('\n');
}
