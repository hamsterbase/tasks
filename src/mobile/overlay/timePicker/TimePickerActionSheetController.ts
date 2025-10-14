import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { Emitter } from 'vscf/base/common/event';
import { Disposable } from 'vscf/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';
import { format, setHours, setMinutes, getHours, getMinutes } from 'date-fns';

export interface TimeValue {
  date: string;
  hour: number;
  minute: number;
}

export class TimePickerActionSheetController extends Disposable {
  static create(
    initialTime: number | undefined,
    onTimeSelected: (time: number) => Promise<void> | void,
    onCancel: () => void,
    instantiationService: IInstantiationService
  ) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('action-sheet', OverlayEnum.timePicker, (options) => {
      return instantiationService.createInstance(
        TimePickerActionSheetController,
        options,
        initialTime,
        onTimeSelected,
        onCancel
      );
    });
  }

  private _timestamp: number;
  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  get zIndex() {
    return this.option.index;
  }

  constructor(
    public option: OverlayInitOptions,
    initialTime: number | undefined,
    private onTimeSelected: (time: number) => Promise<void> | void,
    private onCancel: () => void,
    @IWorkbenchOverlayService private readonly workbenchOverlayService: IWorkbenchOverlayService
  ) {
    super();
    this._timestamp = initialTime || Date.now();
  }

  get selectedTime(): TimeValue {
    const date = new Date(this._timestamp);
    const hour = getHours(date);
    const minute = getMinutes(date);

    return { hour, minute, date: format(date, 'yyyy-MM-dd') };
  }

  updateHour(hour: number) {
    const date = new Date(this._timestamp);
    this._timestamp = setHours(date, hour).getTime();
    this._onStatusChange.fire();
  }

  updateMinute(minute: number) {
    const date = new Date(this._timestamp);
    this._timestamp = setMinutes(date, minute).getTime();
    this._onStatusChange.fire();
  }

  setPresetTime(hour: number, minute: number = 0) {
    let date = new Date(this._timestamp);
    date = setHours(date, hour);
    date = setMinutes(date, minute);
    this._timestamp = date.getTime();
    this._onStatusChange.fire();
  }

  async selectTime() {
    await this.onTimeSelected(this._timestamp);
    this.dispose();
  }

  cancel() {
    this.onCancel();
    this.dispose();
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
    super.dispose();
    this._onStatusChange.fire();
  }
}
