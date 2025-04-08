import { getTodayTimestampInUtc } from '@/base/common/time';

export function isPast(date?: number) {
  if (!date) {
    return false;
  }
  return date < getTodayTimestampInUtc();
}
export function isPastOrToday(date?: number) {
  if (!date) {
    return false;
  }
  return date <= getTodayTimestampInUtc();
}
