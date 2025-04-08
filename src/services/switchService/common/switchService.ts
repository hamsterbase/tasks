import { checkPlatform } from '@/base/browser/checkPlatform';
import { switchKeys, SwitchKeyType } from './switch/main';
import { createDecorator } from '@/packages/vscf/platform/instantiation/common';

export interface ISwitchService {
  readonly _serviceBrand: undefined;

  getLocalSwitch(key: SwitchKeyType): boolean;
}

export class SwitchService implements ISwitchService {
  readonly _serviceBrand: undefined;

  getLocalSwitch(key: SwitchKeyType): boolean {
    if (!switchKeys[key]) {
      throw new Error(`switch key ${key} not found`);
    }
    return switchKeys[key]({ checkPlatform: checkPlatform(), userAgent: navigator.userAgent });
  }
}

export const ISwitchService = createDecorator<ISwitchService>('ISwitchService');
