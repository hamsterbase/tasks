import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';

export function isPast(date?: number) {
  if (!date) {
    return false;
  }
  return date < getTodayTimestampInUtc();
}

export function isTimestampInPast(date?: number) {
  if (!date) {
    return false;
  }
  return date < Date.now();
}

export function isPastOrToday(date?: number) {
  if (!date) {
    return false;
  }
  return date <= getTodayTimestampInUtc();
}
