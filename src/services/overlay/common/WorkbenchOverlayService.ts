import { IDisposable } from 'vscf/base/common/lifecycle';
import { Emitter, Event } from 'vscf/base/common/event';
import { generateUuid } from 'vscf/base/common/uuid';
import { createDecorator } from 'vscf/platform/instantiation/common';

export type OverlayType = 'action-sheet' | 'dialog' | 'toast' | 'menu';

export type OverlayInitOptions = {
  type: OverlayType;
  instanceId: string;
  index: number;
};

export interface IWorkbenchOverlayService {
  readonly _serviceBrand: undefined;
  /**
   * @param id 根据 id 获取overlay
   */
  getOverlay<T>(id: string): T | null;

  /**
   * @param overlay 改变的事件
   */
  onOverlayChange: Event<void>;

  createOverlay(type: OverlayType, overlayEnum: string, creator: (option: OverlayInitOptions) => IDisposable): void;

  removeOverlay(instanceId: string): void;
}

export class WorkbenchOverlayService implements IWorkbenchOverlayService {
  public readonly _serviceBrand: undefined;
  private readonly _overlays = new Map<string, { overlay: IDisposable; type: OverlayType; instanceId: string }>();

  private readonly _onOverlayChange = new Emitter<void>();

  get onOverlayChange(): Event<void> {
    return this._onOverlayChange.event;
  }

  removeOverlay(instanceId: string): void {
    const overlayEnum = Array.from(this._overlays.keys()).find((key) => {
      return this._overlays.get(key)?.instanceId === instanceId;
    });
    if (overlayEnum) {
      this._overlays.delete(overlayEnum);
      this._onOverlayChange.fire();
    }
  }

  getOverlay<T>(overlayEnum: string): T | null {
    return (this._overlays.get(overlayEnum)?.overlay as T) ?? null;
  }

  createOverlay(type: OverlayType, overlayEnum: string, creator: (option: OverlayInitOptions) => IDisposable): void {
    const instanceId = generateUuid();
    const overlay = creator({ type, instanceId, index: this.getIndex(type) });
    const oldOverlay = this._overlays.get(overlayEnum);
    if (oldOverlay) {
      oldOverlay.overlay.dispose();
    }
    this._overlays.set(overlayEnum, { overlay, type, instanceId });
    this._onOverlayChange.fire();
  }

  private getIndex(type: OverlayType) {
    const index = Array.from(this._overlays.entries()).filter(([, overlay]) => overlay.type === type).length;
    switch (type) {
      case 'action-sheet': {
        return index + 500;
      }
      case 'dialog': {
        return index + 1000;
      }
      case 'toast': {
        return index + 1500;
      }
      case 'menu': {
        return index + 2000;
      }
    }
  }
}

export const IWorkbenchOverlayService = createDecorator<IWorkbenchOverlayService>('workbenchOverlayService');
