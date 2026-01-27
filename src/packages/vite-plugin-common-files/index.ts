import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { Alias, Plugin, ResolvedConfig } from 'vite';
import { minimatch } from 'minimatch';

export interface CommonFilesPluginOptions {
  entries: string[];
  validate: (files: string[]) => void | Promise<void>;
  exclude?: string[];
}

export function commonFilesPlugin(options: CommonFilesPluginOptions): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'vite-plugin-common-files',

    apply(_, env) {
      return env.command === 'build';
    },

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async buildStart() {
      const root = config.root;
      const aliases = normalizeAliases(config.resolve.alias);

      const fileSets = options.entries.map((entry) => {
        return collectImports(path.resolve(root, entry), root, aliases);
      });

      const commonFiles = findIntersection(fileSets);

      let relativeFiles = Array.from(commonFiles)
        .map((file) => path.relative(root, file))
        .sort();

      if (options.exclude && options.exclude.length > 0) {
        relativeFiles = relativeFiles.filter((file) => {
          return !options.exclude!.some((pattern) => minimatch(file, pattern, { dot: true }));
        });
      }

      await options.validate(relativeFiles);
    },
  };
}

interface NormalizedAlias {
  find: string;
  replacement: string;
}

function normalizeAliases(alias: Alias[] | undefined): NormalizedAlias[] {
  if (!alias) return [];

  return alias.map((a) => ({
    find: typeof a.find === 'string' ? a.find : a.find.source,
    replacement: a.replacement,
  }));
}

function collectImports(entryFile: string, root: string, aliases: NormalizedAlias[]): Set<string> {
  const visited = new Set<string>();
  const queue = [entryFile];

  while (queue.length > 0) {
    const file = queue.shift()!;
    if (visited.has(file)) continue;

    if (file.includes('node_modules')) continue;

    if (!file.startsWith(root)) continue;

    if (!fs.existsSync(file)) continue;

    visited.add(file);

    const imports = extractImports(file, aliases);
    queue.push(...imports);
  }

  return visited;
}

function extractImports(filePath: string, aliases: NormalizedAlias[]): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');

  const ext = path.extname(filePath);
  let scriptKind: ts.ScriptKind;
  if (ext === '.tsx') {
    scriptKind = ts.ScriptKind.TSX;
  } else if (ext === '.ts') {
    scriptKind = ts.ScriptKind.TS;
  } else if (ext === '.jsx') {
    scriptKind = ts.ScriptKind.JSX;
  } else {
    scriptKind = ts.ScriptKind.JS;
  }

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, scriptKind);

  const imports: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        const resolved = resolveImport(moduleSpecifier.text, filePath, aliases);
        if (resolved) imports.push(resolved);
      }
    }

    if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      if (ts.isStringLiteral(node.moduleSpecifier)) {
        const resolved = resolveImport(node.moduleSpecifier.text, filePath, aliases);
        if (resolved) imports.push(resolved);
      }
    }

    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      if (expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments.length > 0) {
        const arg = node.arguments[0];
        if (ts.isStringLiteral(arg)) {
          const resolved = resolveImport(arg.text, filePath, aliases);
          if (resolved) imports.push(resolved);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return imports;
}

function resolveImport(importPath: string, fromFile: string, aliases: NormalizedAlias[]): string | null {
  let resolvedPath: string | null = null;

  for (const alias of aliases) {
    if (importPath === alias.find) {
      resolvedPath = alias.replacement;
      break;
    }
    if (importPath.startsWith(alias.find + '/')) {
      resolvedPath = path.join(alias.replacement, importPath.slice(alias.find.length + 1));
      break;
    }
  }

  if (!resolvedPath) {
    if (importPath.startsWith('.')) {
      resolvedPath = path.resolve(path.dirname(fromFile), importPath);
    } else {
      return null;
    }
  }

  const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];

  for (const ext of extensions) {
    const fullPath = resolvedPath + ext;
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
  }

  for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
    const indexPath = path.join(resolvedPath, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }

  return null;
}

function findIntersection(sets: Set<string>[]): Set<string> {
  if (sets.length === 0) return new Set();
  if (sets.length === 1) return sets[0];

  const [first, ...rest] = sets;
  return new Set([...first].filter((file) => rest.every((set) => set.has(file))));
}
