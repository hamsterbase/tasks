import { Emitter, Event } from 'vscf/base/common/event';
import { createDecorator } from 'vscf/platform/instantiation/common';
import { App as CapacitorApp } from '@capacitor/app';
import { IDisposable } from 'vscf/base/common/lifecycle';
import { registerPlugin } from '@capacitor/core';
import { ISwitchService } from '@/services/switchService/common/switchService';

export interface NavigateOptions {
  path: string;
  replace?: boolean;
}

export interface INavigationService {
  readonly _serviceBrand: undefined;

  /**
   * Event that fires when navigation is requested
   */
  readonly onNavigate: Event<NavigateOptions>;

  /**
   * Navigate to a specific path
   * @param options Navigation options containing path and optional replace flag
   */
  navigate(options: NavigateOptions): void;

  listenBackButton(callback: () => void): IDisposable;

  /**
   * Navigate backward in history
   */
  goBack(): void;

  /**
   * Navigate forward in history
   */
  goForward(): void;

  /**
   * Event that fires when back navigation is requested
   */
  readonly onGoBack: Event<void>;

  /**
   * Event that fires when forward navigation is requested
   */
  readonly onGoForward: Event<void>;
}

type BackForwardGestures = {
  isEnabled: () => Promise<{ enabled: boolean }>;
  setEnabled: (options: { enabled: boolean }) => Promise<void>;
};

const BackForwardGestures = registerPlugin<BackForwardGestures>('BackForwardGestures');

export class NavigationService implements INavigationService {
  public readonly _serviceBrand: undefined;

  private readonly _onNavigate = new Emitter<NavigateOptions>();
  private readonly _onGoBack = new Emitter<void>();
  private readonly _onGoForward = new Emitter<void>();

  private backButtonListener: Array<() => void> = [];

  private _backForwardGesturesEnabled = false;

  constructor(@ISwitchService private readonly switchService: ISwitchService) {
    CapacitorApp.addListener('backButton', () => {
      const lastListener = this.backButtonListener[this.backButtonListener.length - 1];
      if (lastListener) {
        lastListener();
      }
    });
  }

  public async configBackForwardGestures() {
    if (!this.switchService.getLocalSwitch('iOSBackForwardNavigationGestures')) {
      return;
    }
    const enabled = this.backButtonListener.length === 1;
    const isBack = window.history.state && window.history.state.idx > 0;
    const targetValue = enabled && isBack;
    if (this._backForwardGesturesEnabled === targetValue) {
      return;
    }
    this._backForwardGesturesEnabled = targetValue;
    await BackForwardGestures.setEnabled({ enabled: this._backForwardGesturesEnabled });
  }

  public async enableBackForwardGestures() {
    if (!this.switchService.getLocalSwitch('iOSBackForwardNavigationGestures') || this._backForwardGesturesEnabled) {
      return;
    }
    await BackForwardGestures.setEnabled({ enabled: true });
  }

  get onNavigate(): Event<NavigateOptions> {
    return this._onNavigate.event;
  }

  get onGoBack(): Event<void> {
    return this._onGoBack.event;
  }

  get onGoForward(): Event<void> {
    return this._onGoForward.event;
  }

  navigate(options: NavigateOptions): void {
    this.enableBackForwardGestures().then(() => {
      this._onNavigate.fire(options);
    });
  }

  goBack(): void {
    this._onGoBack.fire();
  }

  goForward(): void {
    this._onGoForward.fire();
  }

  listenBackButton(callback: () => void): IDisposable {
    this.backButtonListener.push(callback);
    this.configBackForwardGestures();
    return {
      dispose: () => {
        this.backButtonListener = this.backButtonListener.filter((item) => item !== callback);
        this.configBackForwardGestures();
      },
    };
  }
}

export const INavigationService = createDecorator<INavigationService>('navigationService');
