import { checkPlatform } from './checkPlatform';

type Channel = 'ios_appstore' | 'other';

export function getChannel(): Channel {
  const platform = checkPlatform();
  if (platform.isNative && platform.isIOS) {
    return 'ios_appstore';
  }
  return 'other';
}

export function isIosAppStore() {
  return getChannel() === 'ios_appstore';
}

export function isOther() {
  return getChannel() === 'other';
}
