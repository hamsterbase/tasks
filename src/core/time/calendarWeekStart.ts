import { localize } from '@/nls';

export type CalendarWeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function getCalendarLeadingDaysCount(date: Date, weekStartDay: CalendarWeekStartDay) {
  return (date.getDay() - weekStartDay + 7) % 7;
}

export function getCalendarWeekdayLabels(weekStartDay: CalendarWeekStartDay) {
  const weekdays = [
    localize('date_picker.sunday', 'Sun'),
    localize('date_picker.monday', 'Mon'),
    localize('date_picker.tuesday', 'Tue'),
    localize('date_picker.wednesday', 'Wed'),
    localize('date_picker.thursday', 'Thu'),
    localize('date_picker.friday', 'Fri'),
    localize('date_picker.saturday', 'Sat'),
  ];

  return [...weekdays.slice(weekStartDay), ...weekdays.slice(0, weekStartDay)];
}

export function getCalendarWeekStartOptions(): Array<{ value: CalendarWeekStartDay; label: string }> {
  return [
    { value: 1, label: localize('settings.weekday.monday', 'Monday') },
    { value: 2, label: localize('settings.weekday.tuesday', 'Tuesday') },
    { value: 3, label: localize('settings.weekday.wednesday', 'Wednesday') },
    { value: 4, label: localize('settings.weekday.thursday', 'Thursday') },
    { value: 5, label: localize('settings.weekday.friday', 'Friday') },
    { value: 6, label: localize('settings.weekday.saturday', 'Saturday') },
    { value: 0, label: localize('settings.weekday.sunday', 'Sunday') },
  ];
}
