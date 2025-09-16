import { hideBottomMenuWhenKeyboardShow } from './hideBottomMenuWhenKeyboardShow';
import { iOSBackForwardNavigationGestures } from './iOSBackForwardNavigationGestures';
import { shouldIgnoreSafeBottom } from './shouldIgnoreSafeBottom';
import { showIOSPurchaseButton } from './showIOSPurchaseButton';
import { showNativeAboutButton } from './showNativeAboutButton';
import { showNormalPurchaseButton } from './showNormalPurchaseButton';

export const switchKeys = {
  showIOSPurchaseButton,
  iOSBackForwardNavigationGestures,
  hideBottomMenuWhenKeyboardShow,
  showNativeAboutButton,
  shouldIgnoreSafeBottom,
  showNormalPurchaseButton,
} as const;

export type SwitchKeyType = keyof typeof switchKeys;
