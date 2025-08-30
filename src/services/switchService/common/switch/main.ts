import { hideBottomMenuWhenKeyboardShow } from './hideBottomMenuWhenKeyboardShow';
import { iOSBackForwardNavigationGestures } from './iOSBackForwardNavigationGestures';
import { shouldIgnoreSafeBottom } from './shouldIgnoreSafeBottom';
import { showIOSPurchaseButton } from './showIOSPurchaseButton';
import { showNativeAboutButton } from './showNativeAboutButton';
import { showPrivacyAgreementOverlay } from './showPrivacyAgreementOverlay';

export const switchKeys = {
  showIOSPurchaseButton,
  iOSBackForwardNavigationGestures,
  hideBottomMenuWhenKeyboardShow,
  showNativeAboutButton,
  showPrivacyAgreementOverlay,
  shouldIgnoreSafeBottom,
} as const;

export type SwitchKeyType = keyof typeof switchKeys;
