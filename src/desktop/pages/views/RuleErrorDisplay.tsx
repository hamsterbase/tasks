import { desktopStyles } from '@/desktop/theme/main';
import type { ParseResult } from '@/core/filter/ruleFactory';
import React from 'react';

interface RuleErrorDisplayProps {
  source: string;
  result: ParseResult | null;
}

/**
 * Renders the rule source with a caret pointing at the parse error location,
 * mirroring the test-time renderError helper.
 */
export const RuleErrorDisplay: React.FC<RuleErrorDisplayProps> = ({ source, result }) => {
  if (!result || result.success) return null;
  const { start, end } = result.error.location;
  const safeStart = Math.max(0, Math.min(start, source.length));
  const safeEnd = Math.max(safeStart, Math.min(end, source.length));
  const caretWidth = Math.max(1, safeEnd - safeStart);
  const caret = ' '.repeat(safeStart) + '^'.repeat(caretWidth);
  return (
    <pre className={desktopStyles.ViewRuleError}>
      {source === '' ? '<empty>' : source}
      {'\n'}
      {caret}
      {'\n'}
      {result.error.code}: {result.error.message}
    </pre>
  );
};
