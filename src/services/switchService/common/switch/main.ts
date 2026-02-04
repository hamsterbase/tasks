import { hideFABWhenKeyboardShow } from './hideFABWhenKeyboardShow';
import { iOSBackForwardNavigationGestures } from './iOSBackForwardNavigationGestures';
import { shouldIgnoreSafeBottom } from './shouldIgnoreSafeBottom';
import { showIOSPurchaseButton } from './showIOSPurchaseButton';
import { showNativeAboutButton } from './showNativeAboutButton';
import { showNormalPurchaseButton } from './showNormalPurchaseButton';
import { showOfficialWebsiteURL } from './showOfficialWebsiteURL';

export const switchKeys = {
  showIOSPurchaseButton,
  iOSBackForwardNavigationGestures,
  hideFABWhenKeyboardShow,
  showNativeAboutButton,
  shouldIgnoreSafeBottom,
  showNormalPurchaseButton,
  showOfficialWebsiteURL,
} as const;

export type SwitchKeyType = keyof typeof switchKeys;
