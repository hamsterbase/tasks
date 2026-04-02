import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { getCurrentLocale, getDateFnsLocale } from '@/locales/common/locale';
import { format } from 'date-fns';
import { getDateFromUTCTimeStamp } from './getDateFromUTCTimeStamp';

const todayDateFormat = {
  'zh-CN': 'M月d日',
  'en-US': 'MMM d',
};

export function formatTodayTitle(currentDate?: number): string {
  if (!currentDate) {
    currentDate = getTodayTimestampInUtc();
  }
  const date = getDateFromUTCTimeStamp(currentDate);
  const locale = getCurrentLocale() as keyof typeof todayDateFormat;
  return format(date, todayDateFormat[locale], { locale: getDateFnsLocale() });
}
