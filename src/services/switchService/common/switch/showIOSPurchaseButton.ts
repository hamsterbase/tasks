import { IGetLocalSwitchOptions } from './types';

export const showIOSPurchaseButton = (options: IGetLocalSwitchOptions) => {
  const { isIOS, isNative } = options.checkPlatform;
  return isIOS && isNative;
};
