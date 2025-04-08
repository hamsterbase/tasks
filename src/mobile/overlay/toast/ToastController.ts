import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService, OverlayInitOptions } from '@/services/overlay/common/WorkbenchOverlayService';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/base/common/lifecycle';
export interface ToastOptions {
  message: string;
  position?: 'center' | 'top';
  duration?: number;
  forbidClick?: boolean;
}

export class ToastController implements IDisposable {
  static create(options: ToastOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('toast', OverlayEnum.toast, (initOptions) => {
      return instantiationService.createInstance(ToastController, options, initOptions);
    });
  }

  private readonly _onStatusChange = new Emitter<void>();
  readonly onStatusChange = this._onStatusChange.event;

  readonly zIndex: number;
  readonly instanceId: string;

  constructor(
    private readonly options: ToastOptions,
    initOptions: OverlayInitOptions,
    @IWorkbenchOverlayService private readonly workbenchOverlayService: IWorkbenchOverlayService
  ) {
    this.zIndex = initOptions.index;
    this.instanceId = initOptions.instanceId;
    if (this.duration > 0) {
      setTimeout(() => {
        this.dispose();
      }, this.duration);
    }
  }

  get position(): 'center' | 'top' {
    return this.options.position ?? 'center';
  }

  get message(): string {
    return this.options.message;
  }

  get duration(): number {
    return this.options.duration ?? 1500;
  }

  get forbidClick(): boolean {
    return this.options.forbidClick ?? false;
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.instanceId);
  }
}
