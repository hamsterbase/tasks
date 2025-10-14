import { formatTimeStampToDate } from './formatTimeStampToDate';
import { getCurrentDateStr } from './getCurrentDateStr';

export function isTimestampToday(timestamp: number) {
  return getCurrentDateStr() === formatTimeStampToDate(timestamp);
}
