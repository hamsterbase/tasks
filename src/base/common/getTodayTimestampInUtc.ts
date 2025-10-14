import { getCurrentDateStr } from '@/core/time/getCurrentDateStr';
import { getUTCTimeStampFromDateStr } from '@/core/time/getUTCTimeStampFromDateStr';

export function getTodayTimestampInUtc() {
  return getUTCTimeStampFromDateStr(getCurrentDateStr()).valueOf();
}
