import { IGetLocalSwitchOptions } from './types';

/**
 * 是否开启 iOS 返回手势
 * @param options 开关参数
 * @returns
 */
export function iOSBackForwardNavigationGestures(options: IGetLocalSwitchOptions) {
  const { isIOS, isNative } = options.checkPlatform;
  if (isIOS && isNative) {
    return true;
  }
  return false;
}
