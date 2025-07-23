import { Capacitor } from '@capacitor/core';

export interface ICheckPlatform {
  platform: string;
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  isElectron: boolean;
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
}

export function checkPlatform(): ICheckPlatform {
  const platform = Capacitor.getPlatform();
  const isNative = platform === 'ios' || platform === 'android';

  // Check if running in Electron
  const userAgent = navigator.userAgent.toLowerCase();
  const isElectron = userAgent.indexOf(' electron/') > -1;

  // Check OS platform using userAgent since navigator.platform is deprecated
  const isMac = userAgent.indexOf('mac') >= 0 || userAgent.indexOf('darwin') >= 0;
  const isWindows =
    userAgent.indexOf('windows') >= 0 || userAgent.indexOf('win32') >= 0 || userAgent.indexOf('win64') >= 0;
  const isLinux = userAgent.indexOf('linux') >= 0 && userAgent.indexOf('android') === -1;

  return {
    platform,
    isNative,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
    isElectron,
    isMac,
    isWindows,
    isLinux,
  };
}
