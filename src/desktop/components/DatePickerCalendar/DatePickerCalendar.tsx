import { CircleSmallIcon, LeftIcon, RightIcon } from '@/components/icons';
import { formatShortMonth } from '@/core/time/formatCalendarMonth';
import { isUtcTimestampToday } from '@/core/time/isUtcTimestampToday';
import { calculateElementHeight } from '@/desktop/overlay/datePicker/constant';
import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { VariableSizeList } from 'react-window';
import { WeekdayHeader } from './WeekdayHeader';
import { useDatePickerCalendar } from './useDatePickerCalendar';

interface MonthGridProps {
  days: Array<{
    date: Date;
    value: number | null;
    isCurrentMonth: boolean;
    isSelected: boolean;
  }>;
  onSelectDate: (date: Date) => void;
}

const MonthGrid: React.FC<MonthGridProps> = ({ days, onSelectDate }) => {
  return (
    <div className={desktopStyles.DatePickerCalendarMonthGrid}>
      {days.map((day) => {
        const isToday = isUtcTimestampToday(day.date.getTime());
        return (
          <button
            key={day.date.toString()}
            onClick={() => day.value && onSelectDate(day.date)}
            className={classNames(desktopStyles.DatePickerCalendarDayButton, {
              [desktopStyles.DatePickerCalendarDaySelected]: day.isSelected,
              [desktopStyles.DatePickerCalendarDayNotCurrentMonth]: !day.isCurrentMonth,
              [desktopStyles.DatePickerCalendarDayToday]: isToday && !day.isSelected,
              [desktopStyles.DatePickerCalendarDayCurrentMonth]: day.isCurrentMonth && !isToday && !day.isSelected,
            })}
            disabled={!day.value}
          >
            {isToday && !day.isSelected ? (
              <span className={desktopStyles.DatePickerCalendarTodayLabel}>
                {localize('date_picker.today', 'Today')}
              </span>
            ) : (
              day.value || ''
            )}
          </button>
        );
      })}
    </div>
  );
};

interface DatePickerCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({ selectedDate, onSelectDate }) => {
  const listRef = useRef<VariableSizeList>(null);

  const {
    visibleMonthTitle,
    handlePrevMonth,
    handleNextMonth,
    handleGoToToday,
    handleItemsRendered,
    getMonthRowCount,
    getMonthData,
  } = useDatePickerCalendar(selectedDate, listRef);

  const getItemSize = (index: number) => {
    const rowCount = getMonthRowCount(index);
    return (
      calculateElementHeight(desktopStyles.DatePickerCalendarMonthHeaderTitle) +
      rowCount * calculateElementHeight(desktopStyles.DatePickerCalendarDayButton)
    );
  };

  return (
    <div>
      <div className={desktopStyles.DatePickerCalendarHeaderContainer}>
        <div className={desktopStyles.DatePickerCalendarHeaderTitle}>{visibleMonthTitle}</div>
        <div className={desktopStyles.DatePickerCalendarNavContainer}>
          <button onClick={handlePrevMonth} className={desktopStyles.DatePickerCalendarNavButton}>
            <LeftIcon className={desktopStyles.DatePickerCalendarNavIcon} />
          </button>
          <button
            onClick={handleGoToToday}
            className={desktopStyles.DatePickerCalendarNavButton}
            title={localize('date_picker.go_to_today', 'Go to today')}
          >
            <CircleSmallIcon className={desktopStyles.DatePickerCalendarNavIcon} />
          </button>
          <button onClick={handleNextMonth} className={desktopStyles.DatePickerCalendarNavButton}>
            <RightIcon className={desktopStyles.DatePickerCalendarNavIcon} />
          </button>
        </div>
      </div>
      <div className={desktopStyles.DatePickerCalendarCalendarWrapper}>
        <WeekdayHeader />
        <div className={desktopStyles.DatePickerCalendarScrollContainer}>
          <VariableSizeList
            ref={listRef}
            height={calculateElementHeight(desktopStyles.DatePickerCalendarScrollContainer)}
            width="100%"
            itemCount={1000}
            itemSize={getItemSize}
            onItemsRendered={handleItemsRendered}
          >
            {({ index, style }: { index: number; style: React.CSSProperties }) => {
              const monthData = getMonthData(index, selectedDate);
              return (
                <div style={style}>
                  <div className={desktopStyles.DatePickerCalendarMonthHeaderTitle}>
                    {formatShortMonth(monthData.date)}
                  </div>
                  <MonthGrid days={monthData.days} onSelectDate={onSelectDate} />
                </div>
              );
            }}
          </VariableSizeList>
        </div>
      </div>
    </div>
  );
};
