import { DatePickerCalendar } from '@/desktop/components/DatePickerCalendar/DatePickerCalendar';
import { OverlayContainer } from '@/desktop/components/Overlay/OverlayContainer';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React from 'react';
import { calculateElementWidth } from '../datePicker/constant';
import { TimePickerOverlayController } from './TimePickerOverlayController';
import { TimeScrollColumn } from './TimeScrollColumn';
import { useDesktopMessage } from '../desktopMessage/useDesktopMessage';

export const TimePickerOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const desktopMessage = useDesktopMessage();
  const controller: TimePickerOverlayController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.desktopTimePicker
  );
  useWatchEvent(controller?.onStatusChange);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

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

  return (
    <OverlayContainer
      zIndex={controller.zIndex}
      onDispose={() => controller.dispose()}
      left={position.x - calculateElementWidth(desktopStyles.TimePickerOverlayContainer)}
      top={position.y}
      className={desktopStyles.TimePickerOverlayContainer}
      filter={{
        value: controller.getCurrentInputValue() || '',
        placeholder: 'YYYY-MM-DD HH:mm',
        onChange: (value) => controller.updateInputValue(value),
        autoFocus: true,
      }}
    >
      <div className={desktopStyles.TimePickerOverlayMainContent}>
        <div className={desktopStyles.TimePickerOverlayCalendarSection}>
          <DatePickerCalendar
            selectedDate={controller.selectedDate}
            onSelectDate={(date) => controller?.selectDate(date)}
          />
        </div>
        <div className={desktopStyles.TimePickerOverlayTimeSection}>
          <div className={desktopStyles.TimePickerScrollColumnWrapper + ' border-r border-line-regular'}>
            <TimeScrollColumn
              values={hours}
              selectedValue={controller.getCurrentHour()}
              onValueChange={(hour) => controller.updateHour(hour)}
              formatValue={(value) => value.toString().padStart(2, '0')}
            />
          </div>
          <div className={desktopStyles.TimePickerScrollColumnWrapper}>
            <TimeScrollColumn
              values={minutes}
              selectedValue={controller.getCurrentMinute()}
              onValueChange={(minute) => controller.updateMinute(minute)}
              formatValue={(value) => value.toString().padStart(2, '0')}
            />
          </div>
        </div>
      </div>

      {/* Footer with confirm button */}
      <div className={desktopStyles.TimePickerOverlayFooter}>
        <SettingButton onClick={() => controller.clearDate()} variant="default" color="danger" inline size="small">
          {localize('time_picker.remove', 'Remove')}
        </SettingButton>
        <div className="flex gap-2">
          <SettingButton onClick={() => controller.dispose()} variant="text" inline size="small">
            {localize('time_picker.cancel', 'Cancel')}
          </SettingButton>
          <SettingButton onClick={handleConfirm} variant="solid" color="primary" inline size="small">
            {localize('time_picker.confirm', 'Confirm')}
          </SettingButton>
        </div>
      </div>
    </OverlayContainer>
  );
};
