import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/internal/base/common/lifecycle';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';

export type MessageType = 'success' | 'error' | 'info';

export interface MessageOptions {
  message: string;
  type: MessageType;
  duration?: number;
  onClose?: () => void;
}

export class DesktopMessageController implements IDisposable {
  static create(options: MessageOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    console.log('createOverlay');
    return workbenchOverlayService.createOverlay('message', OverlayEnum.message, (initOptions) => {
      return instantiationService.createInstance(DesktopMessageController, initOptions, options);
    });
  }

  get zIndex() {
    return this.option.index;
  }

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  private _timeout?: NodeJS.Timeout;

  constructor(
    private option: OverlayInitOptions,
    private messageOptions: MessageOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {
    const duration = this.messageOptions.duration ?? 3000;
    if (duration > 0) {
      this._timeout = setTimeout(() => {
        this.dispose();
      }, duration);
    }
  }

  get message() {
    return this.messageOptions.message;
  }

  get type() {
    return this.messageOptions.type;
  }

  handleClose() {
    if (this.messageOptions.onClose) {
      this.messageOptions.onClose();
    }
    this.dispose();
  }

  dispose() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
  }
}
