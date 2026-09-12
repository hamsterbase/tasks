import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { promises as fs } from 'node:fs';
import { builtinModules } from 'node:module';
import * as path from 'node:path';
import { OutputOptions, OutputPlugin, rollup, RollupOptions } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import packageJSON from '../../package.json';
import { checkSkillDocs } from './checkSkillDocs.js';
import { resolveRoot } from './paths.js';

/** Package published to npm. Its `bin` is what users type. */
export const CLI_PACKAGE_NAME = '@hamsterbase/tasks-cli';
export const CLI_BIN_NAME = 'hamsterbase-tasks';
/** Build output, ready to `npm publish` as-is. */
export const CLI_DIST_DIR = 'dist-cli';

const NODE_ENGINE = '>=20';

/**
 * Only `src/` is bundled. Every npm package the CLI imports stays external and
 * is declared as a dependency of the published package, so native and wasm
 * dependencies (loro-crdt) keep resolving the way they do when running from
 * source.
 */
export async function buildCli(): Promise<string> {
  const distDir = resolveRoot(CLI_DIST_DIR);
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  const externals = new Set<string>();
  const inputOptions: RollupOptions = {
    input: resolveRoot('src/cli/index.tsx'),
    external: (id, _importer, isResolved) => {
      if (isResolved || id.startsWith('.') || path.isAbsolute(id)) return false;
      if (isAliasImport(id)) return false;
      if (isNodeBuiltin(id)) return true;
      externals.add(packageNameOf(id));
      return true;
    },
    plugins: [
      alias({
        entries: [
          { find: '@', replacement: resolveRoot('src') },
          { find: 'vscf', replacement: resolveRoot('src/packages/vscf') },
          { find: 'vs', replacement: resolveRoot('src/packages/vscf/internal') },
        ],
      }),
      resolve({
        preferBuiltins: true,
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      }),
      json(),
      esbuild({
        target: 'es2022',
        sourceMap: false,
        // `--version` reports the published version; running from source says `dev`.
        define: { __CLI_VERSION__: JSON.stringify(cliVersion()) },
        jsx: 'transform',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        loaders: {
          '.ts': 'ts',
          '.tsx': 'tsx',
          '.js': 'js',
          '.jsx': 'jsx',
        },
      }),
    ],
  };

  const outputOptions: OutputOptions = {
    file: path.join(distDir, 'index.js'),
    format: 'esm',
    interop: 'esModule',
    sourcemap: false,
    plugins: [nodeShebang()],
  };

  const bundle = await rollup(inputOptions);
  await bundle.write(outputOptions);
  await bundle.close();
  const distEntry = path.join(distDir, 'index.js');
  await fs.chmod(distEntry, 0o755);

  await createPackageJson(distDir, externals);
  await copySkill(distDir);
  await createReadme(distDir);
  await checkSkillDocs(distEntry);

  console.log(`[cli] Built ${CLI_PACKAGE_NAME}@${cliVersion()} into ${CLI_DIST_DIR}/`);
  return distDir;
}

/** Version of the published CLI, kept separate from the app version. */
export function cliVersion(): string {
  const version = (packageJSON as { cliVersion?: string }).cliVersion;
  if (!version) {
    throw new Error('[cli] package.json is missing the "cliVersion" field');
  }
  return version;
}

/** The entry runs under tsx in the source tree; the published bin runs under node. */
function nodeShebang(): OutputPlugin {
  return {
    name: 'node-shebang',
    renderChunk(code) {
      return code.startsWith('#!') ? code.replace(/^#!.*\n?/, '#!/usr/bin/env node\n') : `#!/usr/bin/env node\n${code}`;
    },
  };
}

function isNodeBuiltin(id: string): boolean {
  return id.startsWith('node:') || builtinModules.includes(id);
}

function isAliasImport(id: string): boolean {
  return ['@/', 'vscf/', 'vs/'].some((prefix) => id.startsWith(prefix)) || id === 'vscf' || id === 'vs';
}

/** `ink/foo` and `@scope/pkg/foo` both resolve to their package name. */
function packageNameOf(id: string): string {
  const segments = id.split('/');
  return id.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0];
}

/**
 * Dependencies are pinned to the ranges this repository already builds and
 * tests against, so the published package cannot drift from the source tree.
 */
function resolveDependencies(externals: Set<string>): Record<string, string> {
  const declared: Record<string, string> = {
    ...packageJSON.devDependencies,
    ...packageJSON.dependencies,
  };

  const dependencies: Record<string, string> = {};
  const missing: string[] = [];
  for (const name of [...externals].sort()) {
    const version = declared[name];
    if (!version) {
      missing.push(name);
      continue;
    }
    dependencies[name] = version;
  }

  if (missing.length > 0) {
    throw new Error(`[cli] no version declared in package.json for: ${missing.join(', ')}`);
  }
  return dependencies;
}

async function createPackageJson(distDir: string, externals: Set<string>): Promise<void> {
  const packageJson = {
    name: CLI_PACKAGE_NAME,
    version: cliVersion(),
    description: 'Command line interface for the HamsterBase Tasks desktop app',
    type: 'module',
    license: packageJSON.license,
    author: packageJSON.author,
    homepage: 'https://hamsterbase.com',
    repository: {
      type: 'git',
      url: 'git+https://github.com/hamsterbase/tasks.git',
    },
    keywords: ['hamsterbase', 'tasks', 'todo', 'cli'],
    bin: {
      [CLI_BIN_NAME]: 'index.js',
    },
    files: ['index.js', 'skills', 'README.md'],
    engines: {
      node: NODE_ENGINE,
    },
    dependencies: resolveDependencies(externals),
  };

  await fs.writeFile(path.join(distDir, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
}

/** The agent skill ships with the package so installing the CLI installs its docs. */
async function copySkill(distDir: string): Promise<void> {
  const skillsDir = path.join(distDir, 'skills');
  await fs.cp(resolveRoot('skills'), skillsDir, { recursive: true });
  await stampSkillVersion(path.join(skillsDir, 'hamsterbase-tasks', 'SKILL.md'));
}

/**
 * The skill describes one CLI release, so its frontmatter version is stamped
 * from `cliVersion`: the shipped copy can never disagree with the package.
 */
async function stampSkillVersion(skillFile: string): Promise<void> {
  const content = await fs.readFile(skillFile, 'utf-8');
  const versionLine = /^version:[ \t]*(.*)$/m;
  const current = content.match(versionLine)?.[1];
  if (current === undefined) {
    throw new Error('[cli] skills/hamsterbase-tasks/SKILL.md is missing a "version" frontmatter field');
  }

  const version = cliVersion();
  if (current !== version) {
    console.warn(`[cli] SKILL.md says version ${current}; publishing it as ${version}. Update the source file.`);
    await fs.writeFile(skillFile, content.replace(versionLine, `version: ${version}`));
  }
}

async function createReadme(distDir: string): Promise<void> {
  const readme = `# ${CLI_PACKAGE_NAME}

Command line interface for [HamsterBase Tasks](https://hamsterbase.com). It reads and writes the
database currently open in the running desktop app; every write is queued for approval there.

## Install

\`\`\`sh
npm install -g ${CLI_PACKAGE_NAME}
\`\`\`

Requires Node.js ${NODE_ENGINE.replace('>=', '')} or newer and the HamsterBase Tasks desktop app.

## Usage

\`\`\`sh
${CLI_BIN_NAME}                       # list commands
${CLI_BIN_NAME} instances --json      # running apps
${CLI_BIN_NAME} today --json          # today's tasks
${CLI_BIN_NAME} <command> --help      # command details
\`\`\`

## Agent skill

\`skills/hamsterbase-tasks/\` contains a ready-to-use agent skill describing the whole command
surface. Copy it into your agent's skills directory to let it drive this CLI.
`;

  await fs.writeFile(path.join(distDir, 'README.md'), readme);
}
