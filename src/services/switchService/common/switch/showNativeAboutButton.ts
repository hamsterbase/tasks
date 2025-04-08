import { IGetLocalSwitchOptions } from './types';

export const showNativeAboutButton = (options: IGetLocalSwitchOptions) => {
  const { isIOS, isNative } = options.checkPlatform;
  if (isIOS && isNative) {
    return true;
  }
  return false;
};
