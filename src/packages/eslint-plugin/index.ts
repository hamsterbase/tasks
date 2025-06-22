import noRestrictedPackages from './no-restricted-packages';
import noBlacklistedStrings from './no-blacklisted-strings';
import noDuplicateLocalization from './no-duplicate-localization';
import noChineseInLocalizationValue from './no-chinese-in-localization-value';

export const rules = {
  'no-restricted-packages': noRestrictedPackages,
  'no-blacklisted-strings': noBlacklistedStrings,
  'no-duplicate-localization': noDuplicateLocalization,
  'no-chinese-in-localization-value': noChineseInLocalizationValue,
};
