import { Capacitor } from '@capacitor/core';

export interface ICheckPlatform {
  platform: string;
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
}

export function checkPlatform(): ICheckPlatform {
  const platform = Capacitor.getPlatform();
  const isNative = platform === 'ios' || platform === 'android';

  return {
    platform,
    isNative,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
  };
}
