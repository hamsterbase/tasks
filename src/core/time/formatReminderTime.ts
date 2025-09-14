import { getTodayTimestampInUtc } from '@/base/common/time';
import { getCurrentLocale, getDateFnsLocale } from '@/locales/common/locale';
import { localize } from '@/nls';
import { format, isSameWeek, isSameMonth, isSameYear, isSameDay, addDays } from 'date-fns';
import { getDateFromUTCTimeStamp } from './getDateFromUTCTimeStamp';

// Time format patterns for different locales
const timeFormat = {
  'zh-CN': 'HH:mm',
  'en-US': 'h:mm a',
};

export interface SeparatedReminderTime {
  date: string;
  time: string;
}

// Date format patterns for different locales (without time)
const dateFormats = {
  // Same day - empty string (no date needed)
  sameDay: {
    'zh-CN': '',
    'en-US': '',
  },
  // Tomorrow
  tomorrow: {
    'zh-CN': '明天',
    'en-US': 'Tomorrow',
  },
  // Same week - show weekday
  sameWeek: {
    'zh-CN': 'eee',
    'en-US': 'eeee',
  },
  // Same month - show month and day
  sameMonth: {
    'zh-CN': 'M月d日',
    'en-US': 'MMM d',
  },
  // Same year - show month and day
  sameYear: {
    'zh-CN': 'M月d日',
    'en-US': 'MMM d',
  },
  // Different year - show full date
  differentYear: {
    'zh-CN': 'yyyy年M月d日',
    'en-US': 'MMM d, yyyy',
  },
};

/**
 * Format timestamp for reminder display with separated date and time fields
 *
 * Returns an object with separate date and time strings:
 * - Same day: { date: "", time: "14:30" } / { date: "", time: "2:30 PM" }
 * - Tomorrow: { date: "明天", time: "14:30" } / { date: "Tomorrow", time: "2:30 PM" }
 * - Same week: { date: "周三", time: "14:30" } / { date: "Wednesday", time: "2:30 PM" }
 * - Same month: { date: "3月15日", time: "14:30" } / { date: "Mar 15", time: "2:30 PM" }
 * - Same year: { date: "3月15日", time: "14:30" } / { date: "Mar 15", time: "2:30 PM" }
 * - Different year: { date: "2024年3月15日", time: "14:30" } / { date: "Mar 15, 2024", time: "2:30 PM" }
 */
export function formatReminderTime(timestamp?: number, currentDate?: number): SeparatedReminderTime {
  if (!timestamp) {
    return { date: '', time: '' };
  }

  if (!currentDate) {
    currentDate = getTodayTimestampInUtc();
  }

  const targetDate = getDateFromUTCTimeStamp(timestamp);
  const currentDateObj = getDateFromUTCTimeStamp(currentDate);
  const locale = getCurrentLocale() as keyof typeof dateFormats.sameDay;
  const dateFnsLocale = getDateFnsLocale();

  // Get time string
  const timeStr = format(targetDate, timeFormat[locale], { locale: dateFnsLocale });

  // Same day - no date needed
  if (isSameDay(targetDate, currentDateObj)) {
    return {
      date: dateFormats.sameDay[locale],
      time: timeStr,
    };
  }

  // Tomorrow
  const tomorrow = addDays(currentDateObj, 1);
  if (isSameDay(targetDate, tomorrow)) {
    if (locale === 'zh-CN') {
      return {
        date: dateFormats.tomorrow[locale],
        time: timeStr,
      };
    } else {
      return {
        date: localize('time.tomorrow', 'tomorrow'),
        time: timeStr,
      };
    }
  }

  // Same week (Monday starts week)
  if (isSameWeek(targetDate, currentDateObj, { weekStartsOn: 1 })) {
    return {
      date: format(targetDate, dateFormats.sameWeek[locale], { locale: dateFnsLocale }),
      time: timeStr,
    };
  }

  // Same month
  if (isSameMonth(targetDate, currentDateObj)) {
    return {
      date: format(targetDate, dateFormats.sameMonth[locale], { locale: dateFnsLocale }),
      time: timeStr,
    };
  }

  // Same year
  if (isSameYear(targetDate, currentDateObj)) {
    return {
      date: format(targetDate, dateFormats.sameYear[locale], { locale: dateFnsLocale }),
      time: timeStr,
    };
  }

  // Different year
  return {
    date: format(targetDate, dateFormats.differentYear[locale], { locale: dateFnsLocale }),
    time: timeStr,
  };
}
