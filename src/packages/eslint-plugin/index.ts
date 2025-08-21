import noRestrictedPackages from './no-restricted-packages';
import noBlacklistedStrings from './no-blacklisted-strings';
import noDuplicateLocalization from './no-duplicate-localization';
import noChineseInLocalizationValue from './no-chinese-in-localization-value';
import detectUnusedDesktopStyles from './detect-unused-desktop-styles';

export const rules = {
  'no-restricted-packages': noRestrictedPackages,
  'no-blacklisted-strings': noBlacklistedStrings,
  'no-duplicate-localization': noDuplicateLocalization,
  'no-chinese-in-localization-value': noChineseInLocalizationValue,
  'detect-unused-desktop-styles': detectUnusedDesktopStyles,
};
