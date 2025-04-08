import { format } from 'date-fns';

export const formatCalendarMonth = (date: Date) => {
  if (globalThis.language === 'zh-CN') {
    return format(date, 'yyyy 年 M 月');
  }
  return format(date, 'MMMM yyyy');
};
