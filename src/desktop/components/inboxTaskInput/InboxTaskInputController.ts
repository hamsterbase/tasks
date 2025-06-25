import { IWorkbenchInstance } from '@/services/instance/common/instanceService';
import { Emitter, Event } from 'vscf/base/common/event';
import { IContextKey, IContextKeyService } from 'vscf/platform/contextkey/common';
import { InboxTaskInputFocus } from './contextKey';

export const INBOX_TASK_INPUT_CONTROLLER_KEY = 'inbox-task-input-controller';

export interface CreateTaskEvent {
  title: string;
}

export class InboxTaskInputController implements IWorkbenchInstance {
  get instanceState(): unknown {
    return this._inputValue;
  }

  private readonly _onInputValueChange = new Emitter<string>();

  private readonly _onCreateTask = new Emitter<CreateTaskEvent>();

  get onInputValueChange(): Event<string> {
    if (this._dispose) {
      throw new Error('InboxTaskInputController is disposed');
    }
    return this._onInputValueChange.event;
  }

  get onCreateTask(): Event<CreateTaskEvent> {
    if (this._dispose) {
      throw new Error('InboxTaskInputController is disposed');
    }
    return this._onCreateTask.event;
  }

  private _inputValue: string = '';
  private _contextKey: IContextKey<boolean>;
  private _dispose = false;

  constructor(@IContextKeyService contextKeyService: IContextKeyService) {
    this._contextKey = InboxTaskInputFocus.bindTo(contextKeyService);
  }

  get inputValue(): string {
    return this._inputValue;
  }

  updateInputValue(value: string): void {
    if (this._inputValue !== value) {
      this._inputValue = value;
      this._onInputValueChange.fire(value);
    }
  }

  setFocus(focused: boolean): void {
    this._contextKey.set(focused);
  }

  createTask(): void {
    if (this._inputValue.trim()) {
      this._onCreateTask.fire({ title: this._inputValue.trim() });
      this.updateInputValue('');
    }
  }

  mount(): void {}
  unmount(): void {
    this._contextKey.reset();
  }
}
