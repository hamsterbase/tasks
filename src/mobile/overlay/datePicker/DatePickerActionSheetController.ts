import { getUtcDayjsFromDateStr } from '@/base/common/time';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { Emitter } from 'vscf/base/common/event';
import { Disposable } from 'vscf/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import dayjs from 'dayjs';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';

interface CalendarDay {
  value: number | null;
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
}

interface MonthData {
  date: Date;
  days: {
    date: Date;
    value: number | null;
    isCurrentMonth: boolean;
    isSelected: boolean;
  }[];
}

export class DatePickerActionSheetController extends Disposable {
  static create(
    initialDate: number | undefined,
    onDateSelected: (date: number) => Promise<void> | void,
    onCancel: () => void,
    instantiationService: IInstantiationService
  ) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('action-sheet', OverlayEnum.datePicker, (options) => {
      return instantiationService.createInstance(
        DatePickerActionSheetController,
        options,
        initialDate,
        onDateSelected,
        onCancel
      );
    });
  }

  private _currentMonthIndex: number = 500;
  private _selectedDate: Date | null = null;
  private _days: CalendarDay[] = [];

  get zIndex() {
    return this.option.index;
  }

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  constructor(
    public option: OverlayInitOptions,
    initialDate: number | undefined,
    private onDateSelected: (date: number) => Promise<void> | void,
    private onCancel: () => void,
    @IWorkbenchOverlayService private readonly workbenchOverlayService: IWorkbenchOverlayService
  ) {
    super();
    this._selectedDate = initialDate ? new Date(initialDate) : null;

    const fiffMonth = dayjs()
      .startOf('month')
      .diff(dayjs(this._selectedDate ?? new Date()).endOf('month'), 'month');
    this._currentMonthIndex = 500 - fiffMonth;
  }

  get currentMonth() {
    const date = new Date();
    date.setMonth(date.getMonth() + (this._currentMonthIndex - 500));
    date.setDate(1);
    return date;
  }

  get days() {
    return this._days;
  }

  getCurrentMonthIndex(): number {
    return this._currentMonthIndex;
  }

  getMonthData(index: number): MonthData {
    const date = dayjs()
      .startOf('month')
      .add(index - 500, 'month')
      .toDate();
    const days = this.calculateDaysForMonth(date);
    return {
      date,
      days,
    };
  }

  private calculateDaysForMonth(monthDate: Date): MonthData['days'] {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = dayjs(monthDate).startOf('month').toDate();
    const lastDay = dayjs(monthDate).endOf('month').toDate();
    const days: MonthData['days'] = [];
    const firstDayOfWeek = firstDay.getDay() || 7;
    for (let i = 1; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, 1 - (firstDayOfWeek - i));
      days.push({
        date: prevDate,
        value: prevDate.getDate(),
        isCurrentMonth: false,
        isSelected: this.isSameDate(prevDate, this._selectedDate),
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        value: i,
        isCurrentMonth: true,
        isSelected: this.isSameDate(currentDate, this._selectedDate),
      });
    }

    const remainingDaysInWeek = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDaysInWeek; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        value: nextDate.getDate(),
        isCurrentMonth: false,
        isSelected: this.isSameDate(nextDate, this._selectedDate),
      });
    }

    return days;
  }

  private isSameDate(date1: Date | null, date2: Date | null): boolean {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  async selectDate(date: Date) {
    try {
      await this.onDateSelected(getUtcDayjsFromDateStr(dayjs(date).format('YYYY-MM-DD')).valueOf());
      this.dispose();
    } catch (error) {
      console.error('Error selecting date:', error);
    }
  }

  cancel() {
    this.onCancel();
    this.dispose();
  }

  getMonthRowCount(index: number): number {
    const monthData = this.getMonthData(index);
    return Math.ceil(monthData.days.length / 7);
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
    super.dispose();
    this._onStatusChange.fire();
  }
}
