import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { localize } from '@/nls';
import { differenceInDays } from 'date-fns';
import { getDateFromUTCTimeStamp } from './getDateFromUTCTimeStamp';
import { isSomeday } from './someday';

export function formatRemainingDays(date?: number, currentDate?: number) {
  if (!date) {
    return '';
  }
  if (isSomeday(date)) {
    return '';
  }
  if (!currentDate) {
    currentDate = getTodayTimestampInUtc();
  }

  const targetDate = getDateFromUTCTimeStamp(date);
  const current = getDateFromUTCTimeStamp(currentDate);
  const dayLeft = differenceInDays(targetDate, current);
  if (dayLeft > 0) {
    return localize('daysLeft', '{0} days left', dayLeft);
  }
  if (dayLeft === 0) {
    return localize('today', 'Today');
  }
  return localize('daysAgo', '{0} days ago', -dayLeft);
}
