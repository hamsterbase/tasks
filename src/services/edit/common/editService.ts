import { createDecorator } from 'vscf/platform/instantiation/common';
import { Emitter, Event } from 'vscf/base/common/event';

export interface IEditEvent {
  inputKey: string;
  value: string | undefined;
}

export interface IEditService {
  getInputValue(inputKey: string): string;
  setInputValue(inputKey: string, value: string): void;
  onInputChange: Event<IEditEvent>;
}

export class EditService implements IEditService {
  private _onInputChange = new Emitter<IEditEvent>();
  public readonly onInputChange = this._onInputChange.event;

  private _inputValueMap = new Map<string, string>();
  constructor() {}

  getInputValue(inputKey: string): string {
    return this._inputValueMap.get(inputKey) ?? '';
  }

  setInputValue(inputKey: string, value: string): void {
    const previousValue = this._inputValueMap.get(inputKey);
    if (previousValue !== value) {
      this._inputValueMap.set(inputKey, value);
      this._onInputChange.fire({ inputKey, value });
    }
  }
}

export const IEditService = createDecorator<IEditService>('editService');
