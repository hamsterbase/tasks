import { getUtcDayjsFromDateStr } from '@/base/common/time';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import dayjs from 'dayjs';
import { Emitter } from 'vscf/base/common/event';
import { Disposable } from 'vscf/base/common/lifecycle';
import { IContextKey, IContextKeyService } from 'vscf/platform/contextkey/common';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';
import { DatePickerFocus } from './contextKey';

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

export class DatePickerOverlayController extends Disposable {
  static create(
    initialDate: number | undefined,
    onDateSelected: (date: number) => void,
    instantiationService: IInstantiationService,
    position?: { x: number; y: number }
  ) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('dialog', OverlayEnum.desktopDatePicker, (options) => {
      const controller = instantiationService.createInstance(
        DatePickerOverlayController,
        options,
        initialDate,
        onDateSelected
      );
      if (position) {
        controller.setPosition(position);
      }
      return controller;
    });
  }

  private _currentMonthIndex: number = 500;
  private _selectedDate: Date | null = null;
  private _days: CalendarDay[] = [];
  private _position: { x: number; y: number } = { x: 0, y: 0 };
  private _currentInputValue: string = '';
  private _visibleMonthIndex: number = 500;

  private _datePickerFocusContext: IContextKey<boolean>;

  get zIndex() {
    return this.option.index;
  }

  get selectedDate() {
    return this._selectedDate;
  }

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  constructor(
    public option: OverlayInitOptions,
    initialDate: number | undefined,
    private onDateSelected: (date: number) => void,
    @IWorkbenchOverlayService private readonly workbenchOverlayService: IWorkbenchOverlayService,
    @IContextKeyService contextKeyService: IContextKeyService
  ) {
    super();
    this._selectedDate = initialDate ? new Date(initialDate) : null;
    this._datePickerFocusContext = DatePickerFocus.bindTo(contextKeyService);

    const diffMonth = dayjs()
      .startOf('month')
      .diff(dayjs(this._selectedDate ?? new Date()).endOf('month'), 'month');
    this._currentMonthIndex = 500 - diffMonth;
    this._visibleMonthIndex = this._currentMonthIndex;

    if (this._selectedDate) {
      this._currentInputValue = dayjs(this._selectedDate).format('YYYY-MM-DD');
    }

    this._datePickerFocusContext.set(true);
  }

  setPosition(position: { x: number; y: number }) {
    this._position = position;
  }

  getPosition(): { x: number; y: number } {
    return this._position;
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

  getVisibleMonthIndex(): number {
    return this._visibleMonthIndex;
  }

  setVisibleMonthIndex(index: number): void {
    this._visibleMonthIndex = index;
    this._onStatusChange.fire();
  }

  navigateToPrevMonth(): number {
    this._visibleMonthIndex = this._visibleMonthIndex - 1;
    this._onStatusChange.fire();
    return this._visibleMonthIndex;
  }

  navigateToNextMonth(): number {
    this._visibleMonthIndex = this._visibleMonthIndex + 1;
    this._onStatusChange.fire();
    return this._visibleMonthIndex;
  }

  navigateToToday(): number {
    this._visibleMonthIndex = 500; // Index for current month
    this._onStatusChange.fire();
    return this._visibleMonthIndex;
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

    // Previous month days
    for (let i = 1; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, 1 - (firstDayOfWeek - i));
      days.push({
        date: prevDate,
        value: prevDate.getDate(),
        isCurrentMonth: false,
        isSelected: this.isSameDate(prevDate, this._selectedDate),
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        value: i,
        isCurrentMonth: true,
        isSelected: this.isSameDate(currentDate, this._selectedDate),
      });
    }

    // Next month days
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

  selectDate(date: Date) {
    this._selectedDate = date;
    this._currentInputValue = dayjs(date).format('YYYY-MM-DD');
    this.onDateSelected(getUtcDayjsFromDateStr(dayjs(date).format('YYYY-MM-DD')).valueOf());
    this.dispose();
  }

  updateInputValue(value: string) {
    this._currentInputValue = value;
    this._onStatusChange.fire();
  }

  getCurrentInputValue(): string {
    return this._currentInputValue;
  }

  saveCurrentDate() {
    if (this._currentInputValue) {
      const selectedDateStr = this._selectedDate ? dayjs(this._selectedDate).format('YYYY-MM-DD') : '';

      if (this._currentInputValue !== selectedDateStr) {
        const parsedDate = dayjs(this._currentInputValue);
        if (parsedDate.isValid()) {
          this.onDateSelected(getUtcDayjsFromDateStr(parsedDate.format('YYYY-MM-DD')).valueOf());
          this.dispose();
          return;
        }
      }
    }

    if (this._selectedDate) {
      this.onDateSelected(getUtcDayjsFromDateStr(dayjs(this._selectedDate).format('YYYY-MM-DD')).valueOf());
      this.dispose();
      return;
    }

    this.dispose();
  }

  getMonthRowCount(index: number): number {
    const monthData = this.getMonthData(index);
    return Math.ceil(monthData.days.length / 7);
  }

  dispose() {
    this._datePickerFocusContext.set(false);
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
    super.dispose();
    this._onStatusChange.fire();
  }
}
