import { addDays, addMonths, addWeeks, startOfDay } from 'date-fns';

export type TimeAfterEnum = 'today' | 'day' | 'week' | 'month' | 'all';

export function getTimeAfter(currentTimestamp: number, range: TimeAfterEnum): number {
  const start = startOfDay(currentTimestamp);
  switch (range) {
    case 'today':
      return start.getTime();
    case 'day':
      return addDays(start, -1).getTime();
    case 'week':
      return addWeeks(start, -1).getTime();
    case 'month':
      return addMonths(start, -1).getTime();
    case 'all':
      return 0;
  }
}
