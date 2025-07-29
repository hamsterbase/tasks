import { getTheme } from '@/base/browser/initializeTheme';
import { formatTheme } from '@/base/common/formatTheme';
import { baseStyles } from './theme/base';
import { einkStyles } from './theme/eink';

formatTheme(baseStyles, getTheme() === 'eink' ? einkStyles : {});

export const styles = baseStyles;
