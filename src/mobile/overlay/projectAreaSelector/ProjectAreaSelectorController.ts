import { TreeID } from 'loro-crdt';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService, OverlayInitOptions } from '@/services/overlay/common/WorkbenchOverlayService';
import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';

export interface ProjectAreaSelectorOptions {
  allowMoveToArea?: boolean;
  onConfirm: (parentId: TreeID) => void;
}

export class ProjectAreaSelectorController implements IDisposable {
  static create(options: ProjectAreaSelectorOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('action-sheet', OverlayEnum.projectAreaSelector, (initOptions) => {
      return instantiationService.createInstance(ProjectAreaSelectorController, options, initOptions);
    });
  }

  private readonly _onStatusChange = new Emitter<void>();
  readonly onStatusChange = this._onStatusChange.event;

  readonly zIndex: number;
  readonly instanceId: string;

  public readonly allowMoveToArea: boolean;

  constructor(
    private readonly options: ProjectAreaSelectorOptions,
    initOptions: OverlayInitOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {
    this.zIndex = initOptions.index;
    this.instanceId = initOptions.instanceId;
    this.allowMoveToArea = options.allowMoveToArea ?? true;
  }

  confirmSelection(id: TreeID) {
    this.options.onConfirm(id);
    this.dispose();
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.instanceId);
  }
}
