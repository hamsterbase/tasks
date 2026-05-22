import { S3Config } from '@/services/attachment/common/attachmentUploadService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/internal/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';

export interface AttachmentsConfigOptions {
  initialConfig: S3Config | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export class AttachmentsConfigController implements IDisposable {
  static create(options: AttachmentsConfigOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('dialog', OverlayEnum.attachmentsConfig, (initOptions) => {
      return instantiationService.createInstance(AttachmentsConfigController, initOptions, options);
    });
  }

  get zIndex() {
    return this.option.index;
  }

  get initialConfig(): S3Config | null {
    return this.attachmentsConfigOptions.initialConfig;
  }

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  constructor(
    private option: OverlayInitOptions,
    private attachmentsConfigOptions: AttachmentsConfigOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {}

  handleCancel() {
    if (this.attachmentsConfigOptions.onCancel) {
      this.attachmentsConfigOptions.onCancel();
    }
    this.dispose();
  }

  handleSuccess() {
    if (this.attachmentsConfigOptions.onSuccess) {
      this.attachmentsConfigOptions.onSuccess();
    }
    this.dispose();
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
  }
}
