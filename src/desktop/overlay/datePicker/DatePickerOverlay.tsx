import { getCurrentDateStr } from '@/base/common/time';
import { CircleSmallIcon, LeftIcon, RightIcon } from '@/components/icons';
import { formatCalendarMonth, formatShortMonth } from '@/core/time/formatCalendarMonth';
import { OverlayContainer } from '@/desktop/components/Overlay/OverlayContainer';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';
import { VariableSizeList } from 'react-window';
import { DatePickerOverlayController } from './DatePickerOverlayController';
import { WeekdayHeader } from './WeekdayHeader';
import { DAY_CELL_HEIGHT, MONTH_HEADER_HEIGHT, SCROLL_CONTAINER_HEIGHT } from './constant';

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
    <div className={desktopStyles.DatePickerOverlayMonthGrid}>
      {days.map((day) => {
        const isToday = getCurrentDateStr() === dayjs(day.date).format('YYYY-MM-DD');
        return (
          <button
            key={day.date.toString()}
            onClick={() => day.value && onSelectDate(day.date)}
            className={classNames(desktopStyles.DatePickerOverlayDayButton, {
              [desktopStyles.DatePickerOverlayDaySelected]: day.isSelected,
              [desktopStyles.DatePickerOverlayDayNotCurrentMonth]: !day.isCurrentMonth,
              [desktopStyles.DatePickerOverlayDayToday]: isToday && !day.isSelected,
              [desktopStyles.DatePickerOverlayDayCurrentMonth]: day.isCurrentMonth && !isToday && !day.isSelected,
            })}
            disabled={!day.value}
          >
            {isToday && !day.isSelected ? (
              <span className={desktopStyles.DatePickerOverlayTodayLabel}>
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

export const DatePickerOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: DatePickerOverlayController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.desktopDatePicker
  );
  useWatchEvent(controller?.onStatusChange);
  const listRef = useRef<VariableSizeList>(null);

  const getItemSize = (index: number) => {
    if (!controller) return 0;
    const rowCount = controller.getMonthRowCount(index);
    return MONTH_HEADER_HEIGHT + rowCount * DAY_CELL_HEIGHT;
  };

  useEffect(() => {
    if (!controller) return;
    const initialIndex = controller.getCurrentMonthIndex();
    listRef.current?.scrollToItem(initialIndex, 'start');

    const currentInputValue = controller.getCurrentInputValue();
    if (currentInputValue) {
      // Input value is already set in controller
    } else if (controller.selectedDate) {
      const dateStr = dayjs(controller.selectedDate).format('YYYY-MM-DD');
      controller.updateInputValue(dateStr);
    }
  }, [controller]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    controller?.updateInputValue(value);
  };

  const handlePrevMonth = () => {
    const newIndex = controller?.navigateToPrevMonth();
    if (newIndex !== undefined) {
      listRef.current?.scrollToItem(newIndex, 'start');
    }
  };

  const handleNextMonth = () => {
    const newIndex = controller?.navigateToNextMonth();
    if (newIndex !== undefined) {
      listRef.current?.scrollToItem(newIndex, 'start');
    }
  };

  const handleGoToToday = () => {
    const todayIndex = controller?.navigateToToday();
    if (todayIndex !== undefined) {
      listRef.current?.scrollToItem(todayIndex, 'start');
    }
  };

  const handleItemsRendered = ({ visibleStartIndex }: { visibleStartIndex: number }) => {
    controller?.setVisibleMonthIndex(visibleStartIndex);
  };

  if (!controller) return null;

  const position = controller.getPosition();

  return (
    <OverlayContainer
      zIndex={controller.zIndex}
      onDispose={() => controller.dispose()}
      left={position.x}
      top={position.y}
      className={desktopStyles.DatePickerOverlayContainer}
    >
      <div className={desktopStyles.DatePickerOverlayInputWrapper}>
        <input
          type="text"
          value={controller?.getCurrentInputValue() || ''}
          onChange={handleInputChange}
          placeholder="YYYY-MM-DD"
          className={desktopStyles.DatePickerOverlayInput}
          autoFocus
        />
      </div>
      <div className={desktopStyles.DatePickerOverlayHeaderContainer}>
        <div className={desktopStyles.DatePickerOverlayHeaderTitle}>
          {controller.getVisibleMonthIndex() !== undefined
            ? formatCalendarMonth(controller.getMonthData(controller.getVisibleMonthIndex() || 0).date)
            : ''}
        </div>

        <div className={desktopStyles.DatePickerOverlayNavContainer}>
          <button onClick={handlePrevMonth} className={desktopStyles.DatePickerOverlayNavButton}>
            <LeftIcon className={desktopStyles.DatePickerOverlayNavIcon} />
          </button>
          <button
            onClick={handleGoToToday}
            className={desktopStyles.DatePickerOverlayNavButton}
            title={localize('date_picker.go_to_today', 'Go to today')}
          >
            <CircleSmallIcon className={desktopStyles.DatePickerOverlayNavIcon} />
          </button>
          <button onClick={handleNextMonth} className={desktopStyles.DatePickerOverlayNavButton}>
            <RightIcon className={desktopStyles.DatePickerOverlayNavIcon} />
          </button>
        </div>
      </div>
      <div className={desktopStyles.DatePickerOverlayCalendarWrapper}>
        <WeekdayHeader />
        <div className={desktopStyles.DatePickerOverlayScrollContainer}>
          <VariableSizeList
            ref={listRef}
            height={SCROLL_CONTAINER_HEIGHT}
            width="100%"
            itemCount={1000}
            itemSize={getItemSize}
            onItemsRendered={handleItemsRendered}
          >
            {({ index, style }: { index: number; style: React.CSSProperties }) => {
              if (!controller) return null;
              const monthData = controller.getMonthData(index);
              return (
                <div style={style}>
                  <div className={desktopStyles.DatePickerOverlayMonthHeaderTitle}>
                    {formatShortMonth(monthData.date)}
                  </div>
                  <MonthGrid days={monthData.days} onSelectDate={(date) => controller.selectDate(date)} />
                </div>
              );
            }}
          </VariableSizeList>
        </div>
      </div>
    </OverlayContainer>
  );
};
