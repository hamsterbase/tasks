import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';
import { VariableSizeList } from 'react-window';
import { DatePickerOverlayController } from './DatePickerOverlayController';
import { DayButton } from './DayButton';
import { WeekdayHeader } from './WeekdayHeader';
import { DAY_CELL_HEIGHT, GAP_HEIGHT } from './constant';
import { formatCalendarMonth, formatShortMonth } from '@/core/time/formatCalendarMonth';
import { CircleSmallIcon, RightIcon, LeftIcon } from '@/components/icons';

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
    <div className="grid grid-cols-7 gap-1 bg-bg1 p-2">
      {days.map((day, dayIndex) => (
        <DayButton key={dayIndex} day={day} onSelect={onSelectDate} />
      ))}
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
    // Include month header height (28px) + calendar grid height
    return 28 + rowCount * (DAY_CELL_HEIGHT + GAP_HEIGHT) + GAP_HEIGHT;
  };

  // Scroll to current month when component mounts
  useEffect(() => {
    if (!controller) return;
    const initialIndex = controller.getCurrentMonthIndex();
    listRef.current?.scrollToItem(initialIndex, 'start');

    // Set initial input value if there's a selected date
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
    <>
      <div className="fixed inset-0" style={{ zIndex: controller.zIndex - 1 }} onClick={() => controller.dispose()} />

      <div
        className="fixed bg-white rounded-lg shadow-xl border border-line-light"
        style={{
          zIndex: controller.zIndex,
          left: position.x,
          top: position.y,
          width: '280px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-line-light">
          <input
            type="text"
            value={controller?.getCurrentInputValue() || ''}
            onChange={handleInputChange}
            placeholder="YYYY-MM-DD"
            className="w-full text-2xl font-light text-center border-none outline-none bg-transparent"
            autoFocus
          />
        </div>

        <div className="p-3">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-medium text-t1">
              {controller.getVisibleMonthIndex() !== undefined
                ? formatCalendarMonth(controller.getMonthData(controller.getVisibleMonthIndex() || 0).date)
                : ''}
            </div>

            <div className="flex items-center">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-bg2 rounded text-lg text-t2 hover:text-t1 transition-colors"
              >
                <LeftIcon className="size-4" />
              </button>
              <button
                onClick={handleGoToToday}
                className="p-1.5 hover:bg-bg2 rounded text-lg text-t2 hover:text-t1 transition-colors"
                title={localize('date_picker.go_to_today', 'Go to today')}
              >
                <CircleSmallIcon className="size-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-bg2 rounded text-lg text-t2 hover:text-t1 transition-colors"
              >
                <RightIcon className="size-4" />
              </button>
            </div>
          </div>

          <div className="text-xs">
            <WeekdayHeader />
            <div style={{ height: '200px', overflow: 'auto' }}>
              <VariableSizeList
                ref={listRef}
                height={200}
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
                      <div className="px-2 py-1 border-b border-line-light/50">
                        <h4 className="text-xs font-medium text-t2">{formatShortMonth(monthData.date)}</h4>
                      </div>
                      <MonthGrid days={monthData.days} onSelectDate={(date) => controller.selectDate(date)} />
                    </div>
                  );
                }}
              </VariableSizeList>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
