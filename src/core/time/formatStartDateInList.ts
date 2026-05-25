import { localize } from '@/nls';
import { format } from 'date-fns';
import { getDateFromUTCTimeStamp } from './getDateFromUTCTimeStamp';
import { isSomeday } from './someday';

export function formatStartDateInList(startDate: number) {
  if (isSomeday(startDate)) {
    return localize('date.someday', 'Someday');
  }
  return format(getDateFromUTCTimeStamp(startDate), 'MM/dd');
}
