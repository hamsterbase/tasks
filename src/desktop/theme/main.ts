import { baseDesktopStyles } from './base';
import { DesktopThemeDefinition } from './types';

function formatTheme(theme: DesktopThemeDefinition): DesktopThemeDefinition {
  const clone = { ...theme };

  Object.entries(clone).forEach(([key, value]) => {
    const values = value.split(' ').map((v) => {
      if (typeof v === 'string' && v.startsWith('extend::')) {
        const extendKey = v.replace('extend::', '') as keyof DesktopThemeDefinition;
        if (extendKey in clone) {
          return clone[extendKey];
        }
      }
      return v;
    });
    clone[key as keyof DesktopThemeDefinition] = values.join(' ');
  });

  return clone;
}

export const desktopStyles = formatTheme(baseDesktopStyles);
