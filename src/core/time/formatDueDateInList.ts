import { getTodayTimestampInUtc } from '@/base/common/time';
import { localize } from '@/nls';
import { differenceInDays, format, isSameYear } from 'date-fns';
import { getDateFromUTCTimeStamp } from './getDateFromUTCTimeStamp';

export function formatDueDateInList(dueDate?: number, currentDate?: number) {
  if (!dueDate) {
    return '';
  }
  if (!currentDate) {
    currentDate = getTodayTimestampInUtc();
  }

  const dueDateInUtc = getDateFromUTCTimeStamp(dueDate);
  const currentDateInUtc = getDateFromUTCTimeStamp(currentDate);

  const diffInDays = differenceInDays(dueDateInUtc, currentDateInUtc);

  if (diffInDays === 0) {
    return localize('tasks.today', 'Today');
  }

  if (diffInDays > 0) {
    if (diffInDays < 30) {
      return localize('tasks.daysLeft', '{0} days left', diffInDays);
    }
    if (diffInDays < 90 || isSameYear(dueDateInUtc, currentDateInUtc)) {
      return format(dueDateInUtc, 'MM/dd');
    }
    return format(dueDateInUtc, 'yyyy');
  } else {
    if (-diffInDays < 30) {
      return localize('tasks.daysAgo', '{0}d ago', -diffInDays);
    }
    if (-diffInDays < 90 || isSameYear(dueDateInUtc, currentDateInUtc)) {
      return format(dueDateInUtc, 'MM/dd');
    }
    return format(dueDateInUtc, 'yyyy');
  }
}
