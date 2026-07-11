import { AttachmentSchema } from '@/core/type';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { Emitter } from '@hamsterbase/foundation/event';
import { IDisposable } from '@hamsterbase/foundation/lifecycle';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';

export interface ImagePreviewOptions {
  attachment: AttachmentSchema;
}

export class ImagePreviewController implements IDisposable {
  static create(options: ImagePreviewOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('dialog', OverlayEnum.imagePreview, (initOptions) => {
      return instantiationService.createInstance(ImagePreviewController, initOptions, options);
    });
  }

  get zIndex() {
    return this.option.index;
  }

  get attachment(): AttachmentSchema {
    return this.imagePreviewOptions.attachment;
  }

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  constructor(
    private option: OverlayInitOptions,
    private imagePreviewOptions: ImagePreviewOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {}

  close() {
    this.dispose();
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
  }
}
