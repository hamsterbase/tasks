import { Emitter } from '@hamsterbase/foundation/event';
import { IDisposable } from '@hamsterbase/foundation/lifecycle';
import { generateUuid } from '@hamsterbase/foundation/uuid';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';

export type MessageType = 'success' | 'error' | 'info';

export interface MessageOptions {
  message: string;
  description?: string;
  type: MessageType;
  duration?: number;
  undo?: () => void;
  onClose?: () => void;
}

export interface MessageItem {
  id: string;
  options: MessageOptions;
  /** incremented when a duplicate message arrives, the UI replays a scale pulse */
  bump: number;
}

export class DesktopMessageController implements IDisposable {
  static create(options: MessageOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    const existing = workbenchOverlayService.getOverlay<DesktopMessageController>(OverlayEnum.message);
    if (existing) {
      existing.addMessage(options);
      return;
    }
    workbenchOverlayService.createOverlay('message', OverlayEnum.message, (initOptions) => {
      const controller = instantiationService.createInstance(DesktopMessageController, initOptions);
      controller.addMessage(options);
      return controller;
    });
  }

  get zIndex() {
    return this.option.index;
  }

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  private _items: MessageItem[] = [];
  private _timers = new Map<string, NodeJS.Timeout>();

  get items(): readonly MessageItem[] {
    return this._items;
  }

  constructor(
    private option: OverlayInitOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {}

  addMessage(options: MessageOptions) {
    const duplicate = this._items.find(
      (item) =>
        item.options.type === options.type &&
        item.options.message === options.message &&
        item.options.description === options.description
    );
    if (duplicate) {
      duplicate.bump++;
      this.scheduleDismiss(duplicate.id, options.duration);
      this._onStatusChange.fire();
      return;
    }
    const item: MessageItem = { id: generateUuid(), options, bump: 0 };
    this._items.push(item);
    this.scheduleDismiss(item.id, options.duration);
    this._onStatusChange.fire();
  }

  close(id: string) {
    const item = this._items.find((item) => item.id === id);
    if (!item) {
      return;
    }
    item.options.onClose?.();
    this.removeMessage(id);
  }

  undo(id: string) {
    const item = this._items.find((item) => item.id === id);
    item?.options.undo?.();
  }

  private scheduleDismiss(id: string, duration?: number) {
    const timeout = this._timers.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this._timers.delete(id);
    }
    const finalDuration = duration ?? 3000;
    if (finalDuration > 0) {
      this._timers.set(
        id,
        setTimeout(() => {
          this.removeMessage(id);
        }, finalDuration)
      );
    }
  }

  private removeMessage(id: string) {
    const timeout = this._timers.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this._timers.delete(id);
    }
    const index = this._items.findIndex((item) => item.id === id);
    if (index === -1) {
      return;
    }
    this._items.splice(index, 1);
    if (this._items.length === 0) {
      this.dispose();
    } else {
      this._onStatusChange.fire();
    }
  }

  dispose() {
    this._timers.forEach((timeout) => clearTimeout(timeout));
    this._timers.clear();
    this._items = [];
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
  }
}
