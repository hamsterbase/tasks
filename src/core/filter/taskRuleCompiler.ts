import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { SOMEDAY_TIMESTAMP } from '@/core/time/someday';
import { ruleFactory } from './ruleFactory';
import { taskRuleSchema } from './taskRuleSchema';
import type { ParseResult } from './ruleFactory';

export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Constants available in task-rule expressions:
 *   SOMEDAY — the magic "someday" timestamp (Dec 31, 2999 UTC)
 *   TODAY   — today's UTC midnight timestamp (resolved at compile time)
 *   DAY     — milliseconds in a day (86_400_000), enables `TODAY - 10 * DAY`
 */
export function compileTaskRule(rule: string): ParseResult {
  const constants = {
    SOMEDAY: SOMEDAY_TIMESTAMP,
    TODAY: getTodayTimestampInUtc(),
    DAY: DAY_MS,
  };
  return ruleFactory(taskRuleSchema, { constants })(rule);
}
