import { hideBottomMenuWhenKeyboardShow } from './hideBottomMenuWhenKeyboardShow';
import { iOSBackForwardNavigationGestures } from './iOSBackForwardNavigationGestures';
import { shouldIgnoreSafeBottom } from './shouldIgnoreSafeBottom';
import { showNativeAboutButton } from './showNativeAboutButton';
import { showPrivacyAgreementOverlay } from './showPrivacyAgreementOverlay';

export const switchKeys = {
  iOSBackForwardNavigationGestures,
  hideBottomMenuWhenKeyboardShow,
  showNativeAboutButton,
  showPrivacyAgreementOverlay,
  shouldIgnoreSafeBottom,
} as const;

export type SwitchKeyType = keyof typeof switchKeys;
