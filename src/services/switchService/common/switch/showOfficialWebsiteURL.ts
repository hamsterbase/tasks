import { IGetLocalSwitchOptions } from './types';

export const showOfficialWebsiteURL = (options: IGetLocalSwitchOptions) => {
  const { isIOS, isNative, isAndroid } = options.checkPlatform;
  if (isIOS && isNative) {
    return false;
  }
  if (isNative && isAndroid && options.androidSource === 'play') {
    return false;
  }
  return true;
};
