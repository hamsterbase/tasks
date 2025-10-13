import { formatUTCTimeStampToDate } from './formatUTCTimeStamp';
import { getCurrentDateStr } from './getCurrentDateStr';

export function isUtcTimestampToday(utcTimestamp: number) {
  return getCurrentDateStr() === formatUTCTimeStampToDate(utcTimestamp);
}
