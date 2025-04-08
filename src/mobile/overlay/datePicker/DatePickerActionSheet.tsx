import { formatCalendarMonth } from '@/core/time/formatCalendarMonth';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ActionSheet } from '@/mobile/components/ActionSheet';
import { styles } from '@/mobile/theme';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React, { useEffect, useRef } from 'react';
import { VariableSizeList } from 'react-window';
import { DatePickerActionSheetController } from './DatePickerActionSheetController';
import { DayButton } from './DayButton';
import { WeekdayHeader } from './WeekdayHeader';
import { DAY_CELL_HEIGHT, GAP_HEIGHT, ITEM_HEIGHT, MONTH_HEADER_HEIGHT } from './constant';

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
    <div className={`grid grid-cols-7 gap-1 ${styles.datePickerBackground} ${styles.datePickerContentPadding} py-1`}>
      {days.map((day, dayIndex) => (
        <DayButton key={dayIndex} day={day} onSelect={onSelectDate} />
      ))}
    </div>
  );
};

// Main DatePickerActionSheet component
export const DatePickerActionSheet: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: DatePickerActionSheetController | null = workbenchOverlayService.getOverlay(OverlayEnum.datePicker);
  useWatchEvent(controller?.onStatusChange);
  const listRef = useRef<VariableSizeList>(null);

  const getItemSize = (index: number) => {
    if (!controller) return 0;
    const rowCount = controller.getMonthRowCount(index);
    return MONTH_HEADER_HEIGHT + rowCount * (DAY_CELL_HEIGHT + GAP_HEIGHT) + GAP_HEIGHT;
  };

  // Scroll to current month when component mounts
  useEffect(() => {
    if (!controller) return;
    listRef.current?.scrollToItem(controller.getCurrentMonthIndex(), 'start');
  }, [controller]);

  if (!controller) return null;

  return (
    <ActionSheet
      zIndex={controller.zIndex}
      onClose={() => controller.dispose()}
      className={styles.datePickerBackground}
      contentClassName={styles.datePickerActionSheetPadding}
    >
      <div>
        <WeekdayHeader />
        <VariableSizeList ref={listRef} height={ITEM_HEIGHT} width="100%" itemCount={1000} itemSize={getItemSize}>
          {({ index, style }: { index: number; style: React.CSSProperties }) => {
            if (!controller) return null;
            const monthData = controller.getMonthData(index);
            return (
              <div style={style}>
                <div
                  className={`flex justify-between items-center sticky top-[00px] ${styles.datePickerHeaderBackground} ${styles.datePickerHeaderPadding} z-10`}
                >
                  <span className={`font-medium ${styles.datePickerTitlePadding}`}>
                    {formatCalendarMonth(monthData.date)}
                  </span>
                </div>
                <MonthGrid days={monthData.days} onSelectDate={(date) => controller.selectDate(date)} />
              </div>
            );
          }}
        </VariableSizeList>
      </div>
    </ActionSheet>
  );
};
