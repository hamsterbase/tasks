import { RecurringDateRule } from './parseRecurringRule';

export function recurringToString(input?: RecurringDateRule | null): string {
  if (!input) return '';
  let res: string = '';
  if (typeof input.years === 'number' && input.years > 0) {
    res += `${input.years}y`;
  }
  if (typeof input.months === 'number' && input.months > 0) {
    res += `${input.months}m`;
  }
  if (typeof input.weeks === 'number' && input.weeks > 0) {
    res += `${input.weeks}w`;
  }
  if (typeof input.days === 'number' && input.days != 0) {
    res += `${input.days}d`;
  }
  if (input.from) {
    res = `${input.from}:${res}`;
  }
  return res;
}
