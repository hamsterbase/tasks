import { OverlayContainer } from '@/desktop/components/Overlay/OverlayContainer';
import { CircleSmallIcon, LeftIcon, RightIcon } from '@/components/icons';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
import { addMonths, format, startOfMonth } from 'date-fns';
import React from 'react';
import { calculateDaysForMonth } from '@/desktop/components/DatePickerCalendar/useDatePickerCalendar';
import { calculateElementWidth } from '../datePicker/constant';
import { TimePickerOverlayController } from './TimePickerOverlayController';
import { useDesktopMessage } from '../desktopMessage/useDesktopMessage';

const styles = {
  container:
    'w-[19rem] bg-bg1 border border-line-regular rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden',
  display: 'px-3 py-2 border-b border-line-light text-xs text-t1',
  body: 'flex',
  calendarCol: 'flex-1 min-w-0 px-2 pb-2 border-r border-line-light',
  monthHeader: 'flex items-center justify-between pt-2 pb-1',
  monthLabel: 'text-xs font-medium text-t1',
  nav: 'flex items-center gap-0.5',
  navButton:
    'size-5 flex items-center justify-center rounded-sm text-t3 hover:bg-bg3 hover:text-t1 cursor-pointer transition-colors',
  weekdayRow: 'grid grid-cols-7 gap-0.5 pt-1 pb-0.5',
  weekdayCell: 'h-5 flex items-center justify-center text-[10px] text-t3',
  grid: 'grid grid-cols-7 gap-0.5 bg-bg1',
  dayCell:
    'h-7 rounded-sm text-xs flex items-center justify-center transition-colors cursor-pointer hover:bg-bg3 text-t1',
  dayCellMuted: 'text-t4',
  dayCellToday: 'text-brand',
  dayCellSelected: 'bg-brand text-white hover:bg-brand',
  timeCol: 'w-10 relative border-r border-line-light last:border-r-0',
  timeColScroll: 'absolute inset-0 overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  timeItem:
    'h-7 flex items-center justify-center text-xs text-t2 rounded-sm cursor-pointer hover:bg-bg3 transition-colors mx-1',
  timeItemSelected: 'bg-brand text-white hover:bg-brand hover:text-white',
  footer: 'flex items-center justify-end gap-2 px-3 py-2 border-t border-line-light',
  cancelButton: 'text-xs text-t2 px-3 py-1 rounded-md hover:bg-bg3 hover:text-t1 cursor-pointer transition-colors',
  confirmButton: 'text-xs text-white bg-brand px-3 py-1 rounded-md hover:opacity-90 cursor-pointer transition-opacity',
};

const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
const hours = Array.from({ length: 24 }, (_, index) => index);
const minutes = Array.from({ length: 60 }, (_, index) => index);

function buildCalendarCells(monthDate: Date, selectedDate: Date | null) {
  const cells = [...calculateDaysForMonth(monthDate, selectedDate)];
  const existingNextMonthCount = cells.filter((cell) => !cell.isCurrentMonth && cell.date > monthDate).length;
  const extraCount = 42 - cells.length;

  for (let index = 1; index <= extraCount; index++) {
    const value = existingNextMonthCount + index;
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, value);
    cells.push({
      date,
      value,
      isCurrentMonth: false,
      isSelected:
        Boolean(selectedDate) &&
        selectedDate?.getDate() === date.getDate() &&
        selectedDate?.getMonth() === date.getMonth() &&
        selectedDate?.getFullYear() === date.getFullYear(),
    });
  }

  return cells;
}

export const TimePickerOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const desktopMessage = useDesktopMessage();
  const controller: TimePickerOverlayController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.desktopTimePicker
  );
  useWatchEvent(controller?.onStatusChange);
  const hourColRef = React.useRef<HTMLDivElement>(null);
  const minuteColRef = React.useRef<HTMLDivElement>(null);
  const [visibleMonth, setVisibleMonth] = React.useState(() => startOfMonth(new Date()));

  React.useEffect(() => {
    if (!controller) return;
    setVisibleMonth(startOfMonth(controller.selectedDate));
  }, [controller, controller?.selectedDate]);

  React.useEffect(() => {
    if (!controller) return;

    const scrollIntoSelection = (container: HTMLDivElement | null, selector: string) => {
      if (!container) return;
      const target = container.querySelector(selector) as HTMLElement | null;
      if (!target) return;
      container.scrollTop = target.offsetTop - container.clientHeight / 2 + target.offsetHeight / 2;
    };

    scrollIntoSelection(hourColRef.current, `[data-hour="${controller.getCurrentHour()}"]`);
    scrollIntoSelection(minuteColRef.current, `[data-minute="${controller.getCurrentMinute()}"]`);
  }, [controller, controller?.selectedDate]);

  const handleConfirm = () => {
    try {
      controller?.confirmSelection();
    } catch (error) {
      desktopMessage({
        type: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  if (!controller) return null;

  const position = controller.getPosition();
  const cells = buildCalendarCells(visibleMonth, controller.selectedDate);
  const monthLabel = `${visibleMonth.getMonth() + 1}/${visibleMonth.getFullYear()}`;
  const displayValue = format(controller.selectedDate, 'yyyy-MM-dd HH:mm');

  return (
    <OverlayContainer
      zIndex={controller.zIndex}
      onDispose={() => controller.dispose()}
      left={position.x - calculateElementWidth(styles.container)}
      top={position.y}
      className={styles.container}
      dataTestId={TestIds.TimePicker.Overlay}
    >
      <div className={styles.display}>{displayValue}</div>

      <div className={styles.body}>
        <div className={styles.calendarCol}>
          <div className={styles.monthHeader}>
            <span className={styles.monthLabel}>{monthLabel}</span>
            <div className={styles.nav}>
              <span className={styles.navButton} onClick={() => setVisibleMonth((current) => addMonths(current, -1))}>
                <LeftIcon className="size-3.5" strokeWidth={1.5} />
              </span>
              <span className={styles.navButton} onClick={() => setVisibleMonth(startOfMonth(new Date()))}>
                <CircleSmallIcon className="size-2.5" strokeWidth={1.5} />
              </span>
              <span className={styles.navButton} onClick={() => setVisibleMonth((current) => addMonths(current, 1))}>
                <RightIcon className="size-3.5" strokeWidth={1.5} />
              </span>
            </div>
          </div>

          <div className={styles.weekdayRow}>
            {weekdays.map((weekday) => (
              <div key={weekday} className={styles.weekdayCell}>
                {weekday}
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            {cells.map((cell) => {
              const isToday =
                cell.date.getDate() === new Date().getDate() &&
                cell.date.getMonth() === new Date().getMonth() &&
                cell.date.getFullYear() === new Date().getFullYear();
              return (
                <div
                  key={cell.date.toISOString()}
                  className={classNames(styles.dayCell, {
                    [styles.dayCellMuted]: !cell.isCurrentMonth,
                    [styles.dayCellToday]: isToday && !cell.isSelected,
                    [styles.dayCellSelected]: cell.isSelected,
                  })}
                  onClick={() => controller.selectDate(cell.date)}
                >
                  {cell.value}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.timeCol}>
          <div ref={hourColRef} className={styles.timeColScroll}>
            {hours.map((hour) => (
              <div
                key={`hour-${hour}`}
                data-hour={hour}
                className={classNames(styles.timeItem, {
                  [styles.timeItemSelected]: hour === controller.getCurrentHour(),
                })}
                onClick={() => controller.updateHour(hour)}
              >
                {hour.toString().padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.timeCol}>
          <div ref={minuteColRef} className={styles.timeColScroll}>
            {minutes.map((minute) => (
              <div
                key={`minute-${minute}`}
                data-minute={minute}
                className={classNames(styles.timeItem, {
                  [styles.timeItemSelected]: minute === controller.getCurrentMinute(),
                })}
                onClick={() => controller.updateMinute(minute)}
              >
                {minute.toString().padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelButton} onClick={() => controller.dispose()}>
          {localize('time_picker.cancel', 'Cancel')}
        </button>
        <button className={styles.confirmButton} onClick={handleConfirm}>
          {localize('time_picker.confirm', 'Confirm')}
        </button>
      </div>
    </OverlayContainer>
  );
};
