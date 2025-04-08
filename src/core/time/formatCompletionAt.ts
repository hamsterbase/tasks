import { format, isSameDay } from 'date-fns';
import { localize } from '@/nls';

export function formatCompletionAt(completionAt: number) {
  if (isSameDay(completionAt, Date.now())) {
    return localize('date.today', 'Today');
  }
  return format(completionAt, 'MM/dd');
}
