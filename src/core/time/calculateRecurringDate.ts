import { getUTCTimeStampFromDateStr } from './getUTCTimeStampFromDateStr';
import { RecurringDateRule } from './parseRecurringRule';

export interface RecurringDateResult {
  nextDate: Date;
}

/**
 * Calculate the next date based on recurring rule
 * Rules follow priority: years > months > weeks > days
 *
 * Examples:
 * - 1y -> next year January 1st
 * - 1y10m -> next year January 1st + 10 months (next year October 1st)
 * - 2m -> next month 1st + 1 month
 * - 1w -> next Monday
 * - 4w -> next Monday + 3 weeks
 * - 1d -> tomorrow
 */
export function calculateRecurringDate(rule: RecurringDateRule, baseDate: string): Date {
  const { years = 0, months = 0, weeks = 0, days = 0 } = rule;

  if (years === 0 && months === 0 && weeks === 0 && days === 0) {
    throw new Error('Invalid recurring rule: all units are zero');
  }

  // Calculate next date with proper unit boundaries and priority
  const nextDate = new Date(getUTCTimeStampFromDateStr(baseDate).valueOf());

  if (years > 0) {
    // Go to next year's first day, then add remaining years
    nextDate.setFullYear(nextDate.getFullYear() + 1, 0, 1); // January 1st of next year
    nextDate.setFullYear(nextDate.getFullYear() + (years - 1));

    // If months are also specified, add them to the year result
    if (months > 0) {
      nextDate.setMonth(nextDate.getMonth() + months);
    }
  } else if (months > 0) {
    // Go to next month's first day, then add remaining months
    nextDate.setMonth(nextDate.getMonth() + 1, 1); // First day of next month
    nextDate.setMonth(nextDate.getMonth() + (months - 1));
  }

  if (weeks > 0) {
    // Always use "next Monday" logic for weeks, regardless of years/months
    const daysUntilNextMonday = (8 - nextDate.getDay()) % 7;
    const nextMonday = daysUntilNextMonday === 0 ? 7 : daysUntilNextMonday;
    nextDate.setDate(nextDate.getDate() + nextMonday);
    nextDate.setDate(nextDate.getDate() + (weeks - 1) * 7 + days);
  } else if (days > 0 && years === 0 && months === 0) {
    // Only add days if no other units were specified
    nextDate.setDate(nextDate.getDate() + days);
  } else if (days != 0) {
    // If years or months are specified, just add the days
    nextDate.setDate(nextDate.getDate() + days);
  }

  return nextDate;
}
