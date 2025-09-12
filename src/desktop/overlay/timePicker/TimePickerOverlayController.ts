import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import dayjs from 'dayjs';
import { Emitter } from 'vscf/base/common/event';
import { Disposable } from 'vscf/base/common/lifecycle';
import { IContextKey, IContextKeyService } from 'vscf/platform/contextkey/common';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';
import { TimePickerFocus } from './contextKey';

interface UpdateTimeSchema {
  date?: Date;
  hour?: number;
  minute?: number;
}

export class TimePickerOverlayController extends Disposable {
  static create(
    initialDate: number | undefined,
    onDateSelected: (date: number | null) => void,
    instantiationService: IInstantiationService,
    position?: { x: number; y: number }
  ) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('dialog', OverlayEnum.desktopTimePicker, (overlayOptions) => {
      const controller = instantiationService.createInstance(
        TimePickerOverlayController,
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

  private _selectedDate: Date = new Date();
  private _position: { x: number; y: number } = { x: 0, y: 0 };
  private _currentInputValue: string = '';

  private _timePickerFocusContext: IContextKey<boolean>;

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
    this._selectedDate = initialDate ? new Date(initialDate) : new Date();
    this._timePickerFocusContext = TimePickerFocus.bindTo(contextKeyService);

    const selectedDayjs = dayjs(this._selectedDate);
    this._currentInputValue = selectedDayjs.format('YYYY-MM-DD HH:mm');
    this._timePickerFocusContext.set(true);
  }

  setPosition(position: { x: number; y: number }) {
    this._position = position;
  }

  getPosition(): { x: number; y: number } {
    return this._position;
  }

  selectDate(date: Date) {
    this.updateTime({ date });
  }

  updateInputValue(value: string) {
    this._currentInputValue = value;
    if (value && value.trim() !== '') {
      const parsedDate = dayjs(value);
      if (parsedDate.isValid()) {
        this._selectedDate = parsedDate.toDate();
      }
    }
    this._onStatusChange.fire();
  }

  getCurrentInputValue(): string {
    return this._currentInputValue;
  }

  clearDate() {
    this.onDateSelected(null);
    this.dispose();
  }

  getCurrentTimeValue(): string {
    return dayjs(this._selectedDate).format('HH:mm');
  }

  getCurrentHour(): number {
    return dayjs(this._selectedDate).hour();
  }

  getCurrentMinute(): number {
    return dayjs(this._selectedDate).minute();
  }

  updateHour(hour: number) {
    this.updateTime({ hour });
  }

  updateMinute(minute: number) {
    this.updateTime({ minute });
  }

  confirmSelection() {
    if (this._currentInputValue) {
      const parsedDate = dayjs(this._currentInputValue);
      if (parsedDate.isValid()) {
        this.onDateSelected(this._selectedDate?.valueOf());
      } else {
        throw new Error(localize('invalid.date', 'Invalid date format'));
      }
    }
    this.dispose();
  }

  dispose() {
    this._timePickerFocusContext.set(false);
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
    super.dispose();
    this._onStatusChange.fire();
  }

  private updateTime(schema: UpdateTimeSchema) {
    let dateWithTime = dayjs(this._selectedDate);
    if (schema.date) {
      dateWithTime = dayjs(schema.date).minute(dateWithTime.minute()).hour(dateWithTime.hour());
    }
    if (typeof schema.hour === 'number') {
      dateWithTime = dateWithTime.hour(schema.hour);
    }
    if (typeof schema.minute === 'number') {
      dateWithTime = dateWithTime.minute(schema.minute);
    }
    this.updateSelectDate(dateWithTime.toDate());
  }

  private updateSelectDate(dateWithTime: Date) {
    this._currentInputValue = dayjs(dateWithTime).format('YYYY-MM-DD HH:mm');
    this._selectedDate = dateWithTime;
    this._onStatusChange.fire();
  }
}
