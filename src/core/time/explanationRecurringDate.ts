import { localize } from '@/nls';
import { RecurringDateRule } from './parseRecurringRule';

const labels = {
  nextYearJan1: localize('recurringDate.nextYearJan1', 'Next year January 1st'),
  nextMonth1st: localize('recurringDate.nextMonth1st', 'Next month 1st'),
  nextMonday: localize('recurringDate.nextMonday', 'Next Monday'),
  years: localize('recurringDate.years', 'years'),
  year: localize('recurringDate.year', 'year'),
  months: localize('recurringDate.months', 'months'),
  month: localize('recurringDate.month', 'month'),
  weeks: localize('recurringDate.weeks', 'weeks'),
  week: localize('recurringDate.week', 'week'),
  days: localize('recurringDate.days', 'days'),
  day: localize('recurringDate.day', 'day'),
  then: localize('recurringDate.then', '→'),
  tomorrow: localize('recurringDate.tomorrow', 'Tomorrow'),
};

function formatDay(num: number): string {
  return `${num > 0 ? '+' : ''}${num} ${num > 1 ? labels.days : labels.day}`;
}

function formatWeek(num: number): string {
  return `+${num} ${num > 1 ? labels.weeks : labels.week}`;
}

function formatMonth(num: number): string {
  return `+${num} ${num > 1 ? labels.months : labels.month}`;
}
function formatYear(num: number): string {
  return `+${num} ${num > 1 ? labels.years : labels.year}`;
}

/**
 * Generate human-readable explanation for recurring date calculation
 * Examples:
 * - "// Next year + 10 months"
 * - "// Next month + 14 months" (for 15m)
 * - "// Next year + 2 months + 5 days"
 */
export function explanationRecurringDate(rule: RecurringDateRule): string {
  const { years = 0, months = 0, weeks = 0, days = 0 } = rule;
  const parts: string[] = [];

  if (years > 0) {
    if (years === 1) {
      parts.push(labels.nextYearJan1);
    } else {
      parts.push(`${labels.nextYearJan1}`, formatYear(years - 1));
    }

    // If months are also specified with years
    if (months > 0) {
      parts.push(formatMonth(months));
    }
  } else if (months > 0) {
    parts.push(labels.nextMonth1st);
    if (months > 1) {
      parts.push(formatMonth(months - 1));
    }
  }

  if (weeks > 0) {
    if (weeks === 1 && days === 0) {
      parts.push(labels.nextMonday);
    } else if (weeks === 1 && days !== 0) {
      parts.push(labels.nextMonday, `+${days} ${labels.days}`);
    } else if (days !== 0) {
      parts.push(labels.nextMonday, formatWeek(weeks - 1), `+${days} ${labels.days}`);
    } else {
      parts.push(labels.nextMonday, formatWeek(weeks - 1));
    }
  } else if (days === 1 && years === 0 && months === 0) {
    parts.push(labels.tomorrow);
  } else if (days !== 0) {
    parts.push(formatDay(days));
  }

  return parts.join(' ' + labels.then + ' ');
}
