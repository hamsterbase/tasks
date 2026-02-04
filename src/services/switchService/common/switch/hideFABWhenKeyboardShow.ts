import { IGetLocalSwitchOptions } from './types';

export const hideFABWhenKeyboardShow = (options: IGetLocalSwitchOptions) => {
  const { isIOS, isNative } = options.checkPlatform;
  if (isIOS && isNative) {
    return true;
  }
  return false;
};
