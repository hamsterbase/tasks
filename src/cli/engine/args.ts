export interface CliOption {
  /** Long flag name without dashes, e.g. `db`. */
  name: string;
  /** Value placeholder shown in help, e.g. `<id>`. Omit for boolean flags. */
  arg?: string;
  description: string;
}

export interface ParsedArgs {
  /** Positional arguments, in order. */
  _: string[];
  /** Parsed flags. Value flags hold a string; boolean flags hold `true`. */
  flags: Record<string, string | boolean>;
  /** True when `-h` / `--help` was passed anywhere. */
  help: boolean;
}

/**
 * Tiny argv parser tailored to this CLI. `valueFlags` lists the long flag
 * names that consume the next token as their value (e.g. `db` for `--db x`);
 * every other `--flag` is treated as a boolean. `--flag=value` is also
 * accepted. Anything not starting with `-` is a positional.
 */
export function parseArgs(argv: string[], valueFlags: Set<string> = new Set()): ParsedArgs {
  const _: string[] = [];
  const flags: Record<string, string | boolean> = {};
  let help = false;

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (token === '-h' || token === '--help') {
      help = true;
      continue;
    }

    if (token.startsWith('--')) {
      const body = token.slice(2);
      const eq = body.indexOf('=');
      if (eq !== -1) {
        flags[body.slice(0, eq)] = body.slice(eq + 1);
        continue;
      }
      if (valueFlags.has(body)) {
        flags[body] = argv[i + 1] ?? '';
        i++;
      } else {
        flags[body] = true;
      }
      continue;
    }

    _.push(token);
  }

  return { _, flags, help };
}
