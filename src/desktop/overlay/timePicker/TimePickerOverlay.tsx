import { OverlayContainer } from '@/desktop/components/Overlay/OverlayContainer';
import { CircleSmallIcon, LeftIcon, RightIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
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
      left={position.x - calculateElementWidth(desktopStyles.TimePickerOverlayContainer)}
      top={position.y}
      className={desktopStyles.TimePickerOverlayContainer}
      dataTestId={TestIds.TimePicker.Overlay}
    >
      <div className={desktopStyles.TimePickerOverlayDisplay}>{displayValue}</div>

      <div className={desktopStyles.TimePickerOverlayBody}>
        <div className={desktopStyles.TimePickerOverlayCalendarColumn}>
          <div className={desktopStyles.TimePickerOverlayMonthHeader}>
            <span className={desktopStyles.TimePickerOverlayMonthLabel}>{monthLabel}</span>
            <div className={desktopStyles.TimePickerOverlayNav}>
              <span
                className={desktopStyles.TimePickerOverlayNavButton}
                onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
              >
                <LeftIcon className={desktopStyles.DatePickerCalendarNavIcon} strokeWidth={1.5} />
              </span>
              <span
                className={desktopStyles.TimePickerOverlayNavButton}
                onClick={() => setVisibleMonth(startOfMonth(new Date()))}
              >
                <CircleSmallIcon className={desktopStyles.TimePickerOverlayCurrentMonthIcon} strokeWidth={1.5} />
              </span>
              <span
                className={desktopStyles.TimePickerOverlayNavButton}
                onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
              >
                <RightIcon className={desktopStyles.DatePickerCalendarNavIcon} strokeWidth={1.5} />
              </span>
            </div>
          </div>

          <div className={desktopStyles.TimePickerOverlayWeekdayRow}>
            {weekdays.map((weekday) => (
              <div key={weekday} className={desktopStyles.TimePickerOverlayWeekdayCell}>
                {weekday}
              </div>
            ))}
          </div>

          <div className={desktopStyles.TimePickerOverlayGrid}>
            {cells.map((cell) => {
              const isToday =
                cell.date.getDate() === new Date().getDate() &&
                cell.date.getMonth() === new Date().getMonth() &&
                cell.date.getFullYear() === new Date().getFullYear();
              return (
                <div
                  key={cell.date.toISOString()}
                  className={classNames(desktopStyles.TimePickerOverlayDayCell, {
                    [desktopStyles.TimePickerOverlayDayCellMuted]: !cell.isCurrentMonth,
                    [desktopStyles.TimePickerOverlayDayCellToday]: isToday && !cell.isSelected,
                    [desktopStyles.TimePickerOverlayDayCellSelected]: cell.isSelected,
                  })}
                  onClick={() => controller.selectDate(cell.date)}
                >
                  {cell.value}
                </div>
              );
            })}
          </div>
        </div>

        <div className={desktopStyles.TimePickerOverlayTimeColumn}>
          <div ref={hourColRef} className={desktopStyles.TimePickerOverlayTimeColumnScroll}>
            {hours.map((hour) => (
              <div
                key={`hour-${hour}`}
                data-hour={hour}
                className={classNames(desktopStyles.TimePickerOverlayTimeItem, {
                  [desktopStyles.TimePickerOverlayTimeItemSelected]: hour === controller.getCurrentHour(),
                })}
                onClick={() => controller.updateHour(hour)}
              >
                {hour.toString().padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>

        <div className={desktopStyles.TimePickerOverlayTimeColumn}>
          <div ref={minuteColRef} className={desktopStyles.TimePickerOverlayTimeColumnScroll}>
            {minutes.map((minute) => (
              <div
                key={`minute-${minute}`}
                data-minute={minute}
                className={classNames(desktopStyles.TimePickerOverlayTimeItem, {
                  [desktopStyles.TimePickerOverlayTimeItemSelected]: minute === controller.getCurrentMinute(),
                })}
                onClick={() => controller.updateMinute(minute)}
              >
                {minute.toString().padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={desktopStyles.TimePickerOverlayFooter}>
        <button className={desktopStyles.TimePickerOverlayCancelButton} onClick={() => controller.dispose()}>
          {localize('time_picker.cancel', 'Cancel')}
        </button>
        <button className={desktopStyles.TimePickerOverlayConfirmButton} onClick={handleConfirm}>
          {localize('time_picker.confirm', 'Confirm')}
        </button>
      </div>
    </OverlayContainer>
  );
};
