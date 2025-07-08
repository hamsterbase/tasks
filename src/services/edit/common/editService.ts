import { createDecorator } from 'vscf/platform/instantiation/common';
import { Emitter, Event } from 'vscf/base/common/event';

export interface IEditEvent {
  inputKey: string;
  value: string | undefined;
}

export interface IFocusInputEvent {
  inputId: string;
}

export interface IEditService {
  getInputValue(inputKey: string, defaultValue: string): string;
  setInputValue(inputKey: string, value: string): void;
  onInputChange: Event<IEditEvent>;
  onFocusInput: Event<IFocusInputEvent>;
  focusInput(inputId: string): void;
}

export class EditService implements IEditService {
  private _onInputChange = new Emitter<IEditEvent>();
  public readonly onInputChange = this._onInputChange.event;

  private _onFocusInput = new Emitter<IFocusInputEvent>();
  public readonly onFocusInput = this._onFocusInput.event;

  private _inputValueMap = new Map<string, string>();
  
  constructor() {}

  getInputValue(inputKey: string, defaultValue: string): string {
    if (this._inputValueMap.has(inputKey)) {
      return this._inputValueMap.get(inputKey) ?? '';
    }
    return defaultValue;
  }

  setInputValue(inputKey: string, value: string): void {
    const previousValue = this._inputValueMap.get(inputKey);
    if (previousValue !== value) {
      this._inputValueMap.set(inputKey, value);
      this._onInputChange.fire({ inputKey, value });
    }
  }

  focusInput(inputId: string): void {
    this._onFocusInput.fire({ inputId });
  }
}

export const IEditService = createDecorator<IEditService>('editService');
