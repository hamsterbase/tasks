import { Emitter } from '@hamsterbase/foundation/event';
import { IDisposable } from '@hamsterbase/foundation/lifecycle';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';

export interface CreateDatabaseOptions {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export class CreateDatabaseController implements IDisposable {
  static create(options: CreateDatabaseOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('dialog', OverlayEnum.createDatabase, (initOptions) => {
      return instantiationService.createInstance(CreateDatabaseController, initOptions, options);
    });
  }

  get zIndex() {
    return this.option.index;
  }

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  constructor(
    private option: OverlayInitOptions,
    private createDatabaseOptions: CreateDatabaseOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {}

  handleCancel() {
    if (this.createDatabaseOptions.onCancel) {
      this.createDatabaseOptions.onCancel();
    }
    this.dispose();
  }

  handleSuccess() {
    if (this.createDatabaseOptions.onSuccess) {
      this.createDatabaseOptions.onSuccess();
    }
    this.dispose();
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
  }
}
