// @ts-nocheck
import {
  registerColor,
  asCssVariableName,
  Extensions as ColorRegistryExtensions,
  resolveColorValue,
} from "vs/platform/theme/common/colorRegistry";

import type { IColorRegistry } from "vs/platform/theme/common/colorRegistry";

export {
  IColorRegistry,
  registerColor,
  ColorRegistryExtensions,
  asCssVariableName,
  resolveColorValue,
};

import type {
  IColorTheme,
  IThemingRegistry,
} from "vs/platform/theme/common/themeService";

import {
  IThemeService,
  registerThemingParticipant,
  Extensions as ThemingExtensions,
} from "vs/platform/theme/common/themeService";

export {
  IColorTheme,
  IThemingRegistry,
  IThemeService,
  registerThemingParticipant,
  ThemingExtensions,
};

import {
  ColorScheme,
  isDark,
  isHighContrast,
} from "vs/platform/theme/common/theme";

export { ColorScheme, isDark, isHighContrast };
