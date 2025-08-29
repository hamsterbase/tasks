import { checkPlatform } from '@/base/browser/checkPlatform';
import AndroidSource, { AndroidSourceType } from '@/plugins/AndroidSourcePlugin';
import { createDecorator } from 'vscf/platform/instantiation/common';
import { switchKeys, SwitchKeyType } from './switch/main';

export interface ISwitchService {
  readonly _serviceBrand: undefined;

  getLocalSwitch(key: SwitchKeyType): boolean;

  init(): Promise<void>;
}

export class SwitchService implements ISwitchService {
  readonly _serviceBrand: undefined;

  private androidSource: AndroidSourceType | null = null;

  async init(): Promise<void> {
    try {
      const { source } = await AndroidSource.getSource();
      this.androidSource = source;
    } catch {
      // ignore error
    }
  }

  getLocalSwitch(key: SwitchKeyType): boolean {
    if (!switchKeys[key]) {
      throw new Error(`switch key ${key} not found`);
    }
    return switchKeys[key]({
      checkPlatform: checkPlatform(),
      userAgent: navigator.userAgent,
      androidSource: this.androidSource,
    });
  }
}

export const ISwitchService = createDecorator<ISwitchService>('ISwitchService');
