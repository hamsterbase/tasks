import dayjs from 'dayjs';

export function formatStartDateInList(startDate: number) {
  return dayjs(startDate).format('MM/DD');
}
