import { getTheme } from '@/base/browser/initializeTheme';
import { baseStyles } from './theme/base';
import { einkStyles } from './theme/eink';
import { ThemeDefinition } from './theme/types';

type ThemeKeys = keyof ThemeDefinition;

function formatTheme(theme: ThemeDefinition): ThemeDefinition {
  const clone = { ...theme };

  if (getTheme() === 'eink') {
    Object.entries(einkStyles).forEach(([key, value]) => {
      clone[key as ThemeKeys] = value;
    });
  }

  Object.entries(clone).forEach(([key, value]) => {
    const values = value.split(' ').map((v) => {
      if (typeof v === 'string' && v.startsWith('extend::')) {
        const extendKey = v.replace('extend::', '') as ThemeKeys;
        if (extendKey in clone) {
          return clone[extendKey];
        }
      }
      return v;
    });
    clone[key as ThemeKeys] = values.join(' ');
  });

  return clone;
}

export const styles = formatTheme(baseStyles);
