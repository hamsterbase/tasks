import { TreeID } from 'loro-crdt';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService, OverlayInitOptions } from '@/services/overlay/common/WorkbenchOverlayService';
import { Emitter } from '@hamsterbase/foundation/event';
import { IDisposable } from '@hamsterbase/foundation/lifecycle';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';

export interface ProjectAreaSelectorOptions {
  currentItemId: TreeID;
  onConfirm: (parentId: TreeID | null) => void;
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

  public readonly currentItemId?: TreeID;

  constructor(
    private readonly options: ProjectAreaSelectorOptions,
    initOptions: OverlayInitOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {
    this.zIndex = initOptions.index;
    this.instanceId = initOptions.instanceId;
    this.currentItemId = options.currentItemId;
  }

  confirmSelection(id: TreeID | null) {
    this.options.onConfirm(id);
    this.dispose();
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.instanceId);
  }
}
