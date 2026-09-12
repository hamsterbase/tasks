import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService, OverlayInitOptions } from '@/services/overlay/common/WorkbenchOverlayService';
import { Emitter } from '@hamsterbase/foundation/event';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { IDisposable } from '@hamsterbase/foundation/lifecycle';

export interface ICliApprovalPanelOptions {
  /** project / area uid whose pending requests the panel shows */
  scopeUid: string;
}

export class CliApprovalPanelController implements IDisposable {
  static create(options: ICliApprovalPanelOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('dialog', OverlayEnum.cliApprovalPanel, (initOptions) => {
      return instantiationService.createInstance(CliApprovalPanelController, initOptions, options);
    });
  }

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  constructor(
    private initOptions: OverlayInitOptions,
    private options: ICliApprovalPanelOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {}

  get zIndex() {
    return this.initOptions.index;
  }

  get scopeUid(): string {
    return this.options.scopeUid;
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.initOptions.instanceId);
  }
}
