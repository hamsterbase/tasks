import { enUS, zhCN } from 'date-fns/locale';

export const languageOptions = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: '简体中文',
    value: 'zh-CN',
  },
];

const locals = {
  'en-US': ['en-US', 'en'],
  'zh-CN': ['zh-CN', 'zh'],
} as const;

export function getDateFnsLocale() {
  const locale = getCurrentLocale();
  switch (locale) {
    case 'en-US':
      return enUS;
    case 'zh-CN':
      return zhCN;
  }
  return enUS;
}

export function getCurrentLocale(): string {
  if (globalThis.language && locals[globalThis.language as keyof typeof locals]) {
    return globalThis.language;
  }
  return 'en-US';
}

export function getValidLocaleKey(configLanguage: string) {
  let finalLocal = 'en-US';
  Object.keys(locals).forEach((key: string) => {
    const alias = locals[key as keyof typeof locals];
    if ((alias as readonly string[]).includes(configLanguage)) {
      finalLocal = key;
    }
  });

  return finalLocal;
}
