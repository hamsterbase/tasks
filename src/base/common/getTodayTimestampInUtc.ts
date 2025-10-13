import { getCurrentDateStr } from '@/core/time/getCurrentDateStr';
import { getUtcDayjsFromDateStr } from './time';

export function getTodayTimestampInUtc() {
  return getUtcDayjsFromDateStr(getCurrentDateStr()).valueOf();
}
