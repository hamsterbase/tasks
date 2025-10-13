import { format } from 'date-fns';
import { getDateFromUTCTimeStamp } from './getDateFromUTCTimeStamp';

export function formatStartDateInList(startDate: number) {
  return format(getDateFromUTCTimeStamp(startDate), 'MM/dd');
}
