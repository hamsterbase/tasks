import { format } from 'date-fns';
import { getDateFromUTCTimeStamp } from './getDateFromUTCTimeStamp';

export function formatUTCTimeStampToDate(timestamp: number) {
  return format(getDateFromUTCTimeStamp(timestamp), 'yyyy-MM-dd');
}
