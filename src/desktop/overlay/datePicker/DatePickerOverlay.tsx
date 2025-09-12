import { CalendarDays, CalendarXIcon, TodayIcon } from '@/components/icons';
import { DatePickerCalendar } from '@/desktop/components/DatePickerCalendar/DatePickerCalendar';
import { OverlayContainer } from '@/desktop/components/Overlay/OverlayContainer';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { DatePickerOverlayController } from './DatePickerOverlayController';
import { calculateElementWidth } from './constant';

export const DatePickerOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: DatePickerOverlayController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.desktopDatePicker
  );
  useWatchEvent(controller?.onStatusChange);

  useEffect(() => {
    if (!controller) return;
    if (controller.selectedDate) {
      const dateStr = dayjs(controller.selectedDate).format('YYYY-MM-DD');
      controller.updateInputValue(dateStr);
    }
  }, [controller]);

  if (!controller) return null;

  const position = controller.getPosition();

  return (
    <OverlayContainer
      zIndex={controller.zIndex}
      onDispose={() => controller.dispose()}
      left={position.x - calculateElementWidth(desktopStyles.DatePickerOverlayContainer)}
      top={position.y}
      className={desktopStyles.DatePickerOverlayContainer}
      filter={{
        value: controller.getCurrentInputValue() || '',
        placeholder: 'YYYY-MM-DD',
        onChange: (value) => controller.updateInputValue(value),
        autoFocus: true,
      }}
    >
      <div className={desktopStyles.DatePickerOverlayQuickActionsContainer}>
        <button onClick={() => controller?.selectToday()} className={desktopStyles.DatePickerOverlayQuickActionButton}>
          <TodayIcon className={desktopStyles.DatePickerOverlayQuickActionIcon} />
          {localize('date_picker.today_button', 'Today')}
        </button>
        <button
          onClick={() => controller?.selectTomorrow()}
          className={desktopStyles.DatePickerOverlayQuickActionButton}
        >
          <CalendarDays className={desktopStyles.DatePickerOverlayQuickActionIcon} />
          {localize('date_picker.tomorrow', 'Tomorrow')}
        </button>
        <button onClick={() => controller?.selectNoDate()} className={desktopStyles.DatePickerOverlayQuickActionButton}>
          <CalendarXIcon className={desktopStyles.DatePickerOverlayQuickActionIcon} />
          {localize('date_picker.no_date', 'No Date')}
        </button>
      </div>
      <DatePickerCalendar
        selectedDate={controller.selectedDate}
        onSelectDate={(date) => controller?.selectDate(date)}
      />
    </OverlayContainer>
  );
};
