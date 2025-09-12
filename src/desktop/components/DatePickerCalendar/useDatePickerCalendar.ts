export function getMonthData(index: number, _selectedDate: Date | null): MonthData {
  const date = dayjs()
    .startOf('month')
    .add(index - 500, 'month')
    .toDate();
  const days = calculateDaysForMonth(date, _selectedDate);
  return {
    date,
    days,
  };
}
export function isSameDate(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
export function calculateDaysForMonth(monthDate: Date, _selectedDate: Date | null): MonthData['days'] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = dayjs(monthDate).startOf('month').toDate();
  const lastDay = dayjs(monthDate).endOf('month').toDate();
  const days: MonthData['days'] = [];
  const firstDayOfWeek = firstDay.getDay() || 7;

  // Previous month days
  for (let i = 1; i < firstDayOfWeek; i++) {
    const prevDate = new Date(year, month, 1 - (firstDayOfWeek - i));
    days.push({
      date: prevDate,
      value: prevDate.getDate(),
      isCurrentMonth: false,
      isSelected: isSameDate(prevDate, _selectedDate),
    });
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const currentDate = new Date(year, month, i);
    days.push({
      date: currentDate,
      value: i,
      isCurrentMonth: true,
      isSelected: isSameDate(currentDate, _selectedDate),
    });
  }

  // Next month days
  const remainingDaysInWeek = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingDaysInWeek; i++) {
    const nextDate = new Date(year, month + 1, i);
    days.push({
      date: nextDate,
      value: nextDate.getDate(),
      isCurrentMonth: false,
      isSelected: isSameDate(nextDate, _selectedDate),
    });
  }

  return days;
}
import { formatCalendarMonth } from '@/core/time/formatCalendarMonth';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { VariableSizeList } from 'react-window';

interface MonthData {
  date: Date;
  days: {
    date: Date;
    value: number | null;
    isCurrentMonth: boolean;
    isSelected: boolean;
  }[];
}

export function useDatePickerCalendar(selectedDate: Date | null, listRef: React.RefObject<VariableSizeList>) {
  const [visibleMonthIndex, setVisibleMonthIndex] = useState(500);

  useEffect(() => {
    if (selectedDate) {
      const diffMonth = dayjs().startOf('month').diff(dayjs(selectedDate).startOf('month'), 'month');
      const targetIndex = 500 - diffMonth;
      setVisibleMonthIndex(targetIndex);
      listRef.current?.scrollToItem(targetIndex, 'start');
    } else {
      const todayIndex = 500;
      setVisibleMonthIndex(todayIndex);
      listRef.current?.scrollToItem(todayIndex, 'start');
    }
  }, [selectedDate, listRef]);

  const visibleMonthTitle = formatCalendarMonth(getMonthData(visibleMonthIndex, selectedDate).date);

  const handlePrevMonth = () => {
    const newIndex = visibleMonthIndex - 1;
    setVisibleMonthIndex(newIndex);
    listRef.current?.scrollToItem(newIndex, 'start');
  };

  const handleNextMonth = () => {
    const newIndex = visibleMonthIndex + 1;
    setVisibleMonthIndex(newIndex);
    listRef.current?.scrollToItem(newIndex, 'start');
  };

  const handleGoToToday = () => {
    const todayIndex = 500; // Index for current month
    setVisibleMonthIndex(todayIndex);
    listRef.current?.scrollToItem(todayIndex, 'start');
  };

  const handleItemsRendered = ({ visibleStartIndex }: { visibleStartIndex: number }) => {
    setVisibleMonthIndex(visibleStartIndex);
  };

  function getMonthRowCount(index: number): number {
    const monthData = getMonthData(index, selectedDate);
    return Math.ceil(monthData.days.length / 7);
  }

  return {
    visibleMonthTitle,
    handlePrevMonth,
    handleNextMonth,
    handleGoToToday,
    handleItemsRendered,
    getMonthRowCount,
    getMonthData,
  };
}
