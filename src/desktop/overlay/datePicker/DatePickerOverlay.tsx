import { CalendarXIcon, CircleSmallIcon, LeftIcon, RightIcon, ScheduledIcon, TodayIcon } from '@/components/icons';
import { formatCalendarMonth } from '@/core/time/formatCalendarMonth';
import { isTimestampToday } from '@/core/time/isTimestampToday';
import { WeekdayHeader } from '@/desktop/components/DatePickerCalendar/WeekdayHeader';
import { calculateDaysForMonth } from '@/desktop/components/DatePickerCalendar/useDatePickerCalendar';
import { OverlayContainer } from '@/desktop/components/Overlay/OverlayContainer';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
import { addMonths, format, startOfMonth } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { DatePickerOverlayController } from './DatePickerOverlayController';
import { calculateElementWidth } from './constant';

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
        const isToday = isTimestampToday(day.date.getTime());
        return (
          <button
            key={day.date.toISOString()}
            onClick={() => onSelectDate(day.date)}
            className={classNames(desktopStyles.DatePickerCalendarDayButton, {
              [desktopStyles.DatePickerCalendarDaySelected]: day.isSelected,
              [desktopStyles.DatePickerCalendarDayNotCurrentMonth]: !day.isCurrentMonth,
              [desktopStyles.DatePickerCalendarDayToday]: isToday && !day.isSelected,
              [desktopStyles.DatePickerCalendarDayCurrentMonth]: day.isCurrentMonth && !isToday && !day.isSelected,
            })}
          >
            {day.value}
          </button>
        );
      })}
    </div>
  );
};

export const DatePickerOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: DatePickerOverlayController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.desktopDatePicker
  );
  useWatchEvent(controller?.onStatusChange);

  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    if (!controller) return;

    if (controller.selectedDate) {
      const dateStr = format(controller.selectedDate, 'yyyy-MM-dd');
      controller.updateInputValue(dateStr);
      setVisibleMonth(startOfMonth(controller.selectedDate));
      return;
    }

    setVisibleMonth(startOfMonth(new Date()));
  }, [controller]);

  if (!controller) return null;

  const position = controller.getPosition();
  const monthDays = calculateDaysForMonth(visibleMonth, controller.selectedDate);

  return (
    <OverlayContainer
      zIndex={controller.zIndex}
      onDispose={() => controller.dispose()}
      left={position.x - calculateElementWidth(desktopStyles.DatePickerOverlayContainer)}
      top={position.y}
      className={desktopStyles.DatePickerOverlayContainer}
      dataTestId={TestIds.DatePicker.Overlay}
      filter={{
        value: controller.getCurrentInputValue() || '',
        placeholder: 'YYYY-MM-DD',
        onChange: (value) => controller.updateInputValue(value),
        autoFocus: true,
      }}
    >
      <div className={desktopStyles.DatePickerOverlayQuickActionsContainer}>
        <button onClick={() => controller.selectToday()} className={desktopStyles.DatePickerOverlayQuickActionButton}>
          <TodayIcon className={desktopStyles.DatePickerOverlayQuickActionIcon} />
          {localize('date_picker.today_button', 'Today')}
        </button>
        <button
          onClick={() => controller.selectTomorrow()}
          className={desktopStyles.DatePickerOverlayQuickActionButton}
        >
          <ScheduledIcon className={desktopStyles.DatePickerOverlayQuickActionIcon} />
          {localize('date_picker.tomorrow', 'Tomorrow')}
        </button>
        <button onClick={() => controller.selectNoDate()} className={desktopStyles.DatePickerOverlayQuickActionButton}>
          <CalendarXIcon className={desktopStyles.DatePickerOverlayQuickActionIcon} />
          {localize('date_picker.no_date', 'No date')}
        </button>
      </div>
      <div className="h-px bg-line-light" />
      <div className={desktopStyles.DatePickerCalendarHeaderContainer}>
        <div className={desktopStyles.DatePickerCalendarHeaderTitle}>{formatCalendarMonth(visibleMonth)}</div>
        <div className={desktopStyles.DatePickerCalendarNavContainer}>
          <button
            onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
            className={desktopStyles.DatePickerCalendarNavButton}
          >
            <LeftIcon className={desktopStyles.DatePickerCalendarNavIcon} />
          </button>
          <button
            onClick={() => setVisibleMonth(startOfMonth(new Date()))}
            className={desktopStyles.DatePickerCalendarNavButton}
            title={localize('date_picker.go_to_today', 'Go to today')}
          >
            <CircleSmallIcon className={desktopStyles.DatePickerCalendarNavIcon} />
          </button>
          <button
            onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
            className={desktopStyles.DatePickerCalendarNavButton}
          >
            <RightIcon className={desktopStyles.DatePickerCalendarNavIcon} />
          </button>
        </div>
      </div>
      <div className={desktopStyles.DatePickerCalendarCalendarWrapper}>
        <WeekdayHeader />
        <MonthGrid days={monthDays} onSelectDate={(date) => controller.selectDate(date)} />
      </div>
    </OverlayContainer>
  );
};
