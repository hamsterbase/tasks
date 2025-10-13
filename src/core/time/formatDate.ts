import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { getCurrentLocale, getDateFnsLocale } from '@/locales/common/locale';
import { format, isSameYear } from 'date-fns';
import { getDateFromUTCTimeStamp } from './getDateFromUTCTimeStamp';

const currentYearFormat = {
  'zh-CN': 'EEE, M月 d日',
  'en-US': 'EEE, MMM d',
};
const otherYearFormat = {
  'zh-CN': 'yyyy年 M月 d日',
  'en-US': 'MMM d, yyyy',
};

// 使用 date-fns 格式化日期
// 如果是今年, 就显示 周, 月 日
// 如果不是今年，就显示 月 日，年
// 时间戳是 utc 时间，时区是 0 时区
export function formatDate(dueDate?: number, currentDate?: number) {
  if (!dueDate) {
    return '';
  }
  if (!currentDate) {
    currentDate = getTodayTimestampInUtc();
  }

  const date = getDateFromUTCTimeStamp(dueDate);
  const current = getDateFromUTCTimeStamp(currentDate);
  const isThisYear = isSameYear(date, current);

  if (isThisYear) {
    return format(date, currentYearFormat[getCurrentLocale() as keyof typeof currentYearFormat], {
      locale: getDateFnsLocale(),
    });
  }
  return format(date, otherYearFormat[getCurrentLocale() as keyof typeof otherYearFormat], {
    locale: getDateFnsLocale(),
  });
}
