import { format } from 'date-fns';

export function formatTimeStampToDate(timestamp: number) {
  return format(timestamp, 'yyyy-MM-dd');
}
