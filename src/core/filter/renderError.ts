import type { ParseError } from './ruleFactory';

/**
 * Visualizes a parser error under the source string with a caret pointing at
 * the offending range. Used both by the editor's inline error display and by
 * snapshot tests so the two stay in sync.
 *
 * Example output:
 *   item.title ===
 *              ^^^
 *   SYNTAX_ERROR: Unexpected token
 */
export function renderRuleError(source: string, error: ParseError): string {
  const { start, end } = error.location;
  const safeStart = Math.max(0, Math.min(start, source.length));
  const safeEnd = Math.max(safeStart, Math.min(end, source.length));
  const display = source === '' ? '<empty>' : source;
  const lines = display.split('\n');

  let lineStart = 0;
  let errorLine = 0;
  let col = 0;
  let lineLen = lines[0].length;
  for (let i = 0; i < lines.length; i++) {
    lineLen = lines[i].length;
    if (safeStart <= lineStart + lineLen) {
      errorLine = i;
      col = safeStart - lineStart;
      break;
    }
    lineStart += lineLen + 1;
  }
  const remaining = Math.max(1, lineLen - col);
  const caretWidth = Math.max(1, Math.min(safeEnd - safeStart, remaining));
  const caret = ' '.repeat(col) + '^'.repeat(caretWidth);

  return [
    ...lines.slice(0, errorLine + 1),
    caret,
    ...lines.slice(errorLine + 1),
    `${error.code}: ${error.message}`,
  ].join('\n');
}
