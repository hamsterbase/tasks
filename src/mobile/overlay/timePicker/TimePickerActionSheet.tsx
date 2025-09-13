import { localize } from '@/nls';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ActionSheet } from '@/mobile/components/ActionSheet';
import { styles } from '@/mobile/theme';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React, { useRef, useEffect } from 'react';
import { TimePickerActionSheetController } from './TimePickerActionSheetController';
import { PRESET_TIMES, HOURS, MINUTES } from './constant';
import { MobileButton } from '@/mobile/components/MobileButton';

interface TimeWheelProps {
  value: number;
  onChange: (value: number) => void;
  options: number[];
  formatValue?: (value: number) => string;
}

const TimeWheel: React.FC<TimeWheelProps> = ({ value, onChange, options, formatValue = (v) => v.toString() }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preventEvent = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      preventEvent.current = true;
      const selectedIndex = options.findIndex((option) => option === value);
      if (selectedIndex !== -1) {
        const itemHeight = 32;
        const scrollTop = (selectedIndex + 2) * itemHeight;
        scrollRef.current.scrollTop = Math.max(0, scrollTop);
      }
      preventEvent.current = false;
    }
  }, [value, options]);

  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    if (preventEvent.current) {
      return;
    }
    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollRef.current) {
        const itemHeight = 32;
        const scrollTop = scrollRef.current.scrollTop;
        const selectedIndex = Math.round(scrollTop / itemHeight) - 2;
        onChange(options[selectedIndex]);
      }
    }, 250);
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 h-32 overflow-y-auto"
      style={{ scrollSnapType: 'y mandatory' }}
      onScroll={handleScroll}
    >
      <div className="py-24">
        {options.map((option) => (
          <div
            key={option}
            className={`h-8 flex items-center justify-center cursor-pointer text-lg ${
              value === option ? 'text-brand font-semibold' : 'text-t2'
            }`}
            style={{ scrollSnapAlign: 'center' }}
            onClick={() => onChange(option)}
          >
            {formatValue(option)}
          </div>
        ))}
      </div>
    </div>
  );
};

export const TimePickerActionSheet: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: TimePickerActionSheetController | null = workbenchOverlayService.getOverlay(OverlayEnum.timePicker);
  useWatchEvent(controller?.onStatusChange);

  if (!controller) return null;

  const selectedTime = controller.selectedTime;

  if (!selectedTime) return null;

  return (
    <ActionSheet
      zIndex={controller.zIndex}
      onClose={() => controller.cancel()}
      className={styles.datePickerBackground}
      contentClassName={styles.datePickerActionSheetPadding}
    >
      <div className={styles.datePickerContentPadding}>
        <div className="text-center mb-6">
          <div className="text-base text-t2 mb-2">{selectedTime.date}</div>
          <div className="text-5xl font-light text-t1 tracking-wide">
            {selectedTime.hour.toString().padStart(2, '0')}
            <span className="text-t2 mx-1">:</span>
            {selectedTime.minute.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="flex items-center mb-6 relative">
          <TimeWheel
            value={selectedTime.hour}
            onChange={(hour) => controller.updateHour(hour)}
            options={HOURS}
            formatValue={(h) => h.toString().padStart(2, '0')}
          />

          <div className="text-2xl text-t1 h-8 flex items-center leading-8">-</div>

          <TimeWheel
            value={selectedTime.minute}
            onChange={(minute) => controller.updateMinute(minute)}
            options={MINUTES}
            formatValue={(m) => m.toString().padStart(2, '0')}
          />
        </div>

        <div className="mb-4">
          <div className="text-sm text-t2 mb-2">{localize('time-picker.presets', 'Presets')}</div>
          <div className="flex gap-2">
            {PRESET_TIMES.map((preset) => (
              <button
                key={preset.label}
                className="flex-1 py-2 px-3 rounded-lg bg-bg2 text-t1 text-sm font-medium hover:bg-bg3 transition-colors"
                onClick={() => controller.setPresetTime(preset.hour, preset.minute)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <MobileButton size="large" onClick={() => controller.selectTime()}>
          {localize('time-picker.done', 'Done')}
        </MobileButton>
      </div>
    </ActionSheet>
  );
};
