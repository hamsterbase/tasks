export interface CliOption {
  /** Long flag name without dashes, e.g. `instance`. */
  name: string;
  /** Accepted compatibility spellings, also without dashes. */
  aliases?: string[];
  /** Value placeholder shown in help, e.g. `<id>`. Omit for boolean flags. */
  arg?: string;
  description: string;
  /** Whether the command cannot run without this option. */
  required?: boolean;
  /** Lowest desktop protocol version needed when explicitly passed. Defaults to 1. */
  minProtocolVersion?: number;
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
 * names that consume the next token as their value (e.g. `id` for `--id x`);
 * every other `--flag` is treated as a boolean. `--flag=value` is also
 * accepted. Anything not starting with `-` is a positional.
 *
 * Hand-written on purpose — minimist and yargs-parser were both tried and both
 * corrupt values that start with a dash, because they assume a CLI with short
 * options and parse `-x` in value position as one. This CLI has no short
 * options (only `-h`) and does have dash-leading values, so `--notes "- item"`
 * came back as `notes: ''` plus a junk `" item"` flag under either library.
 * Nothing here needs their real features (arrays, counts, coercion), so the
 * trade was all cost. Re-check that before reaching for a dependency again.
 */
export function parseArgs(
  argv: string[],
  valueFlags: Set<string> = new Set(),
  aliases: Map<string, string> = new Map()
): ParsedArgs {
  const _: string[] = [];
  const flags: Record<string, string | boolean> = {};
  let help = false;

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (token === '-h' || token === '--help') {
      help = true;
      continue;
    }

    // A bare `--` survives `pnpm --dir tasks cli -- <command>`, the documented
    // way to run from a source checkout. Without this it parses as a flag whose
    // name is the empty string and every `.strict()` schema rejects the call.
    // Nothing is lost by dropping it: this CLI takes no positional arguments.
    if (token === '--') {
      continue;
    }

    if (token.startsWith('--')) {
      const body = token.slice(2);
      const eq = body.indexOf('=');
      if (eq !== -1) {
        const name = aliases.get(body.slice(0, eq)) ?? body.slice(0, eq);
        flags[name] = body.slice(eq + 1);
        continue;
      }
      const name = aliases.get(body) ?? body;
      if (valueFlags.has(name)) {
        const next = argv[i + 1];
        // Only another long flag ends a value. A value may legitimately be
        // empty (`--notes ""`) or start with a single dash (`--title "-2 days"`),
        // and treating those as "no value" both dropped the value and leaked the
        // token into the positionals, where it surfaced as a bogus
        // "unexpected positional argument" error.
        if (next !== undefined && !next.startsWith('--')) {
          flags[name] = next;
          i++;
        } else {
          flags[name] = '';
        }
      } else {
        flags[name] = true;
      }
      continue;
    }

    _.push(token);
  }

  return { _, flags, help };
}
