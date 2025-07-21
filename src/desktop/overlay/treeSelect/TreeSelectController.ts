import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService, OverlayInitOptions } from '@/services/overlay/common/WorkbenchOverlayService';
import { TreeID } from 'loro-crdt';
import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';

interface ITreeSelectOptions {
  x: number;
  y: number;
  onConfirm: (id: TreeID) => void;
  allowMoveToArea?: boolean;
  currentItemId?: TreeID;
}

export class TreeSelectController implements IDisposable {
  static create(options: ITreeSelectOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('menu', OverlayEnum.treeSelect, (initOptions) => {
      return instantiationService.createInstance(TreeSelectController, initOptions, options);
    });
  }

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  get zIndex() {
    return this.initOptions.index;
  }

  constructor(
    private initOptions: OverlayInitOptions,
    private options: ITreeSelectOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {}

  get x(): number {
    return this.options.x;
  }

  get y(): number {
    return this.options.y;
  }

  get allowMoveToArea(): boolean {
    return this.options.allowMoveToArea ?? true;
  }

  get currentItemId(): TreeID | undefined {
    return this.options.currentItemId;
  }

  confirmSelection(id: TreeID): void {
    this.options.onConfirm(id);
    this.dispose();
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.initOptions.instanceId);
  }
}
