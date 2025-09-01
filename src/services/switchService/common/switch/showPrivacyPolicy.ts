import { IGetLocalSwitchOptions } from './types';

export const showPrivacyPolicy = (options: IGetLocalSwitchOptions) => {
  const { isAndroid, isNative } = options.checkPlatform;
  const { androidSource } = options;

  if (isAndroid && isNative && androidSource === 'xiaomi') {
    return true;
  }
  return false;
};
