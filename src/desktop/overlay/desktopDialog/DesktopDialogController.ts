import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/internal/base/common/lifecycle';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';

interface DialogAction {
  type: 'input';
  placeholder?: string;
  value?: string;
}

interface DialogActionValue {
  type: 'input';
  value: string;
}

export interface DialogOptions {
  title: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: (action?: DialogActionValue) => void;
  actions?: DialogAction;
}

export class DesktopDialogController implements IDisposable {
  static create(options: DialogOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('dialog', OverlayEnum.dialog, (initOptions) => {
      return instantiationService.createInstance(DesktopDialogController, initOptions, options);
    });
  }

  get zIndex() {
    return this.option.index;
  }

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  constructor(
    private option: OverlayInitOptions,
    private dialogOptions: DialogOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {}

  get title() {
    return this.dialogOptions.title;
  }

  get description() {
    return this.dialogOptions.description || '';
  }

  get cancelText() {
    return this.dialogOptions.cancelText || '';
  }

  get confirmText() {
    return this.dialogOptions.confirmText || '';
  }

  get actions() {
    return this.dialogOptions.actions;
  }

  handleCancel() {
    if (this.dialogOptions.onCancel) {
      this.dialogOptions.onCancel();
    }
    this.dispose();
  }

  handleConfirm(actionValue?: DialogActionValue) {
    if (this.dialogOptions.onConfirm) {
      Promise.resolve(this.dialogOptions.onConfirm(actionValue)).then(() => {
        this.dispose();
      });
    } else {
      this.dispose();
    }
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
  }
}
