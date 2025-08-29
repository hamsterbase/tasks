import { IGetLocalSwitchOptions } from './types';

export const showPrivacyAgreementOverlay = (options: IGetLocalSwitchOptions) => {
  const { isAndroid, isNative } = options.checkPlatform;
  return isAndroid && isNative && options.androidSource === 'xiaomi';
};
