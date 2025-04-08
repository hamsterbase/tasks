import { TimeAfterEnum } from '@/core/time/getTimeAfter';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService, OverlayInitOptions } from '@/services/overlay/common/WorkbenchOverlayService';
import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
interface TaskDisplaySettings {
  showFutureTasks: boolean;
  showCompletedTasks: boolean;
  completedTasksRange: TimeAfterEnum;
}

export interface TaskDisplaySettingsControllerOptions {
  showFutureTasks: boolean;
  showCompletedTasks: boolean;
  completedTasksRange: TimeAfterEnum;
  hideShowFutureTasks?: boolean;
  onChange: (value: TaskDisplaySettings) => void;
}

export class TaskDisplaySettingsController implements IDisposable {
  static create(initOptions: TaskDisplaySettingsControllerOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('action-sheet', OverlayEnum.taskDisplaySettings, (options) => {
      return instantiationService.createInstance(TaskDisplaySettingsController, options, initOptions);
    });
  }

  private readonly _onStatusChange = new Emitter<void>();
  readonly onStatusChange = this._onStatusChange.event;

  get zIndex() {
    return this.option.index;
  }

  private _showFutureTasks = false;
  private _showCompletedTasks = false;
  private _completedTasksRange: TimeAfterEnum = 'all';

  constructor(
    private option: OverlayInitOptions,
    private initOptions: TaskDisplaySettingsControllerOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {
    this._showFutureTasks = this.initOptions.showFutureTasks;
    this._showCompletedTasks = this.initOptions.showCompletedTasks;
    this._completedTasksRange = this.initOptions.completedTasksRange;
    this.onStatusChange(() => {
      this.initOptions.onChange({
        showFutureTasks: this._showFutureTasks,
        showCompletedTasks: this._showCompletedTasks,
        completedTasksRange: this._completedTasksRange,
      });
    });
  }

  get showFutureTasks() {
    return this._showFutureTasks;
  }

  get showCompletedTasks() {
    return this._showCompletedTasks;
  }

  get hideShowFutureTasks() {
    return !!this.initOptions.hideShowFutureTasks;
  }

  get completedTasksRange() {
    return this._completedTasksRange;
  }

  toggleShowFutureTasks() {
    this._showFutureTasks = !this._showFutureTasks;
    this._onStatusChange.fire();
  }

  toggleShowCompletedTasks() {
    this._showCompletedTasks = !this._showCompletedTasks;
    this._onStatusChange.fire();
  }

  changeCompletedTasksRange(range: TimeAfterEnum) {
    this._completedTasksRange = range;
    this._onStatusChange.fire();
  }

  dispose(): void {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
    this._onStatusChange.dispose();
  }
}
