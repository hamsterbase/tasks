import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { Plugin, ResolvedConfig } from 'vite';
import { minimatch } from 'minimatch';

export interface UnusedFilesPluginOptions {
  exclude?: string[];
}

export function unusedFilesPlugin(options: UnusedFilesPluginOptions = {}): Plugin {
  let config: ResolvedConfig;
  const resolvedFiles = new Set<string>();
  let allSourceFiles: string[] = [];

  function trackFile(id: string) {
    if (!id || id.includes('node_modules') || id.startsWith('\0')) return;
    const clean = id.split('?')[0];
    if (clean.endsWith('.ts') || clean.endsWith('.tsx')) {
      const relative = path.relative(config.root, clean);
      if (!relative.startsWith('..')) {
        resolvedFiles.add(relative);
      }
    }
  }

  return {
    name: 'vite-plugin-detect-unused-files',

    apply(_, env) {
      return env.command === 'build';
    },

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    buildStart() {
      const root = config.root;
      const srcDir = path.resolve(root, 'src');

      // Step 1: Glob all .ts/.tsx files under src/ before build
      const allFiles = collectAllFiles(srcDir, ['.ts', '.tsx']).map((f) => path.relative(root, f));

      // Filter out exclude patterns and type-only files
      allSourceFiles = allFiles.filter((file) => {
        if (options.exclude && options.exclude.some((pattern) => minimatch(file, pattern, { dot: true }))) {
          return false;
        }
        if (isTypeOnlyFile(path.resolve(root, file))) {
          return false;
        }
        return true;
      });

      resolvedFiles.clear();
    },

    load(id) {
      trackFile(id);
      return null;
    },

    // Step 3: After build, compare and report unused files
    closeBundle() {
      const unusedFiles = allSourceFiles.filter((f) => !resolvedFiles.has(f)).sort();

      if (unusedFiles.length > 0) {
        console.error('\n┌─────────────────────────────────────────────────┐');
        console.error(`│ Unused files detected: ${String(unusedFiles.length).padEnd(25)} │`);
        console.error('└─────────────────────────────────────────────────┘');
        unusedFiles.forEach((file, index) => {
          const prefix = index === unusedFiles.length - 1 ? '└──' : '├──';
          console.error(`${prefix} ${file}`);
        });
        console.error('');
        throw new Error(
          `Found ${unusedFiles.length} unused file(s) in src/. Please remove them or add them to the exclude list.`
        );
      }

      console.log(`[unused-files] All ${allSourceFiles.length} source files are in use.`);
    },
  };
}

function collectAllFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * A file is type-only if every top-level statement is one of:
 * - import (any form)
 * - export type / export interface
 * - type alias / interface declaration
 * - export declaration that re-exports only types
 *
 * i.e. the file has no runtime value exports or side effects.
 */
function isTypeOnlyFile(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath);
  const scriptKind = ext === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, scriptKind);

  for (const statement of sourceFile.statements) {
    if (!isTypeOnlyStatement(statement)) {
      return false;
    }
  }

  return true;
}

function isTypeOnlyStatement(node: ts.Statement): boolean {
  // Any import is fine (import type, import value — we don't care, it's not a runtime export)
  if (ts.isImportDeclaration(node)) {
    return true;
  }

  // type alias, interface
  if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
    return true;
  }

  // export type { ... } / export type { ... } from '...'
  if (ts.isExportDeclaration(node)) {
    if (node.isTypeOnly) return true;
    // export { ... } from '...' where all elements are type-only
    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      return node.exportClause.elements.every((e) => e.isTypeOnly);
    }
    return false;
  }

  // export interface / export type
  if (ts.isExportAssignment(node)) {
    return false;
  }

  // Handles: export interface Foo {}, export type Foo = ...
  if (hasExportModifier(node)) {
    if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      return true;
    }
    // export const X = createDecorator<T>('...') — DI service identifier, no runtime side effects
    if (ts.isVariableStatement(node)) {
      const decls = node.declarationList.declarations;
      if (decls.length === 1 && decls[0].initializer && ts.isCallExpression(decls[0].initializer)) {
        const call = decls[0].initializer;
        if (ts.isIdentifier(call.expression) && call.expression.text === 'createDecorator') {
          return true;
        }
      }
    }
    return false;
  }

  return false;
}

function hasExportModifier(node: ts.Statement): boolean {
  return (
    ts.canHaveModifiers(node) && ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) === true
  );
}
