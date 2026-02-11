import { IWorkbenchOverlayService, OverlayInitOptions } from '@/services/overlay/common/WorkbenchOverlayService';
import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';

export interface PopupActionItem {
  condition?: boolean;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface PopupActionControllerOptions {
  description?: string;
  groups: {
    items: PopupActionItem[];
  }[];
}

export class PopupActionController implements IDisposable {
  static create(initOptions: PopupActionControllerOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('action-sheet', OverlayEnum.popupAction, (options) => {
      return instantiationService.createInstance(PopupActionController, options, initOptions);
    });
  }

  private readonly _onStatusChange = new Emitter<void>();
  readonly onStatusChange = this._onStatusChange.event;

  get zIndex() {
    return this.option.index;
  }

  constructor(
    private option: OverlayInitOptions,
    private initOptions: PopupActionControllerOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {}

  get description() {
    return this.initOptions.description;
  }

  get groups() {
    return this.initOptions.groups.map((group) => ({
      items: group.items.filter((item) => {
        if (typeof item.condition === 'boolean') {
          return item.condition;
        }
        return true;
      }),
    }));
  }

  dispose(): void {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
    this._onStatusChange.dispose();
  }
}
