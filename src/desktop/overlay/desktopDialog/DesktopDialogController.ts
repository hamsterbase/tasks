import { DialogAction, DialogActionValue, DialogButtonAction } from '@/base/common/componentsType/dialog';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/internal/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';

export interface DialogOptions {
  title: string;
  description?: string;
  cancelText?: string;
  hideFooter?: boolean;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: (actionValue: DialogActionValue) => void;
  actions?: DialogAction[];
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

  private _actionValues: DialogActionValue = {};
  private _errors: Record<string, string> = {};

  constructor(
    private option: OverlayInitOptions,
    private dialogOptions: DialogOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {
    this.initializeActionValues();
  }

  get title() {
    return this.dialogOptions.title;
  }

  get description() {
    return this.dialogOptions.description || '';
  }

  get cancelText() {
    return this.dialogOptions.cancelText || '';
  }

  get hideFooter() {
    return this.dialogOptions.hideFooter || false;
  }

  get confirmText() {
    return this.dialogOptions.confirmText || '';
  }

  get actions() {
    return this.dialogOptions.actions;
  }

  get actionValues() {
    return this._actionValues;
  }

  get errors() {
    return this._errors;
  }

  private initializeActionValues() {
    const initialValues: DialogActionValue = {};
    this.dialogOptions.actions?.forEach((action) => {
      if (action.type === 'input') {
        initialValues[action.key] = action.value || '';
      }
    });
    this._actionValues = initialValues;
  }

  updateActionValue(key: string, value: string) {
    this._actionValues = { ...this._actionValues, [key]: value };

    if (this._errors[key]) {
      const newErrors = { ...this._errors };
      delete newErrors[key];
      this._errors = newErrors;
    }

    this._onStatusChange.fire();
  }

  validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    this.dialogOptions.actions?.forEach((action) => {
      if (action.type === 'input') {
        const value = this._actionValues[action.key] as string;
        if (action.required && (!value || value.trim() === '')) {
          newErrors[action.key] = `${action.label || action.placeholder || 'Field'} is required`;
        } else if (action.validation && value) {
          const validationError = action.validation(value);
          if (validationError) {
            newErrors[action.key] = validationError;
          }
        }
      }
    });

    this._errors = newErrors;
    this._onStatusChange.fire();
    return Object.keys(newErrors).length === 0;
  }

  handleButtonClick(action: DialogButtonAction) {
    if (action.onclick) {
      try {
        const result = action.onclick(this._actionValues);
        if (result instanceof Promise) {
          result
            .then(() => {
              this.handleCancel();
            })
            .catch(() => {});
        } else {
          this.handleCancel();
        }
      } catch {
        // do nothing
      }
    } else {
      this.handleCancel();
    }
  }

  handleCancel() {
    if (this.dialogOptions.onCancel) {
      this.dialogOptions.onCancel();
    }
    this.dispose();
  }

  handleConfirm() {
    if (this.validateForm()) {
      if (this.dialogOptions.onConfirm) {
        Promise.resolve(this.dialogOptions.onConfirm(this._actionValues)).then(() => {
          this.dispose();
        });
      } else {
        this.dispose();
      }
    }
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
  }
}
