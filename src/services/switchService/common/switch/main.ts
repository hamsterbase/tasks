import { hideBottomMenuWhenKeyboardShow } from './hideBottomMenuWhenKeyboardShow';
import { iOSBackForwardNavigationGestures } from './iOSBackForwardNavigationGestures';
import { shouldIgnoreSafeBottom } from './shouldIgnoreSafeBottom';
import { showNativeAboutButton } from './showNativeAboutButton';

export const switchKeys = {
  iOSBackForwardNavigationGestures,
  hideBottomMenuWhenKeyboardShow,
  showNativeAboutButton,
  shouldIgnoreSafeBottom,
} as const;

export type SwitchKeyType = keyof typeof switchKeys;
