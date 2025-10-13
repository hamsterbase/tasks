import { getCurrentDateStr } from '@/core/time/getCurrentDateStr';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
dayjs.extend(customParseFormat);

export function getUtcDayjsFromDateStr(dateStr: string) {
  return dayjs.utc(dateStr, 'YYYY-MM-DD');
}

export function getTodayDayjsUtc() {
  return getUtcDayjsFromDateStr(getCurrentDateStr());
}
