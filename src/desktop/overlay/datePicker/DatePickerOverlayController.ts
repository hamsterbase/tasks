import { formatTimeStampToDate } from '@/core/time/formatTimeStampToDate';
import { getUTCTimeStampFromDateStr } from '@/core/time/getUTCTimeStampFromDateStr';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { format, isValid, parse } from 'date-fns';
import { Emitter } from 'vscf/base/common/event';
import { Disposable } from 'vscf/base/common/lifecycle';
import { IContextKey, IContextKeyService } from 'vscf/platform/contextkey/common';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';
import { DatePickerFocus } from './contextKey';

export class DatePickerOverlayController extends Disposable {
  static create(
    initialDate: number | undefined,
    onDateSelected: (date: number | null) => void,
    instantiationService: IInstantiationService,
    position?: { x: number; y: number }
  ) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('dialog', OverlayEnum.desktopDatePicker, (overlayOptions) => {
      const controller = instantiationService.createInstance(
        DatePickerOverlayController,
        overlayOptions,
        initialDate,
        onDateSelected
      );
      if (position) {
        controller.setPosition(position);
      }
      return controller;
    });
  }

  private _selectedDate: Date | null = null;
  private _position: { x: number; y: number } = { x: 0, y: 0 };
  private _currentInputValue: string = '';

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
    private onDateSelected: (date: number | null) => void,
    @IWorkbenchOverlayService private readonly workbenchOverlayService: IWorkbenchOverlayService,
    @IContextKeyService contextKeyService: IContextKeyService
  ) {
    super();
    this._selectedDate = initialDate ? new Date(initialDate) : null;
    this._datePickerFocusContext = DatePickerFocus.bindTo(contextKeyService);

    if (this._selectedDate) {
      this._currentInputValue = formatTimeStampToDate(this._selectedDate.valueOf());
    }
    this._datePickerFocusContext.set(true);
  }

  setPosition(position: { x: number; y: number }) {
    this._position = position;
  }

  getPosition(): { x: number; y: number } {
    return this._position;
  }

  selectDate(date: Date) {
    this._selectedDate = date;
    this._currentInputValue = formatTimeStampToDate(date.getTime());
    this.onDateSelected(getUTCTimeStampFromDateStr(this._currentInputValue));
    this.dispose();
  }

  selectToday() {
    const todayDate = new Date();
    this.selectDate(todayDate);
  }

  selectTomorrow() {
    const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    this.selectDate(tomorrowDate);
  }

  selectNoDate() {
    this._selectedDate = null;
    this._currentInputValue = '';
    this.onDateSelected(null);
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
      const selectedDateStr = this._selectedDate ? formatTimeStampToDate(this._selectedDate.valueOf()) : '';
      if (this._currentInputValue !== selectedDateStr) {
        const parsedDate = parse(this._currentInputValue, 'yyyy-MM-dd', new Date());
        if (isValid(parsedDate)) {
          this.onDateSelected(getUTCTimeStampFromDateStr(format(parsedDate, 'yyyy-MM-dd')));
          this.dispose();
          return;
        }
      }
    }

    if (this._selectedDate) {
      this.onDateSelected(getUTCTimeStampFromDateStr(format(this._selectedDate, 'yyyy-MM-dd')));
      this.dispose();
      return;
    }

    this.dispose();
  }

  dispose() {
    this._datePickerFocusContext.set(false);
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
    super.dispose();
    this._onStatusChange.fire();
  }
}
