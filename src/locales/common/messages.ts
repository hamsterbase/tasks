import { getValidLocaleKey } from './locale';
import zhCN from '../zh-CN.json';
import enUS from '../en-US.json';

declare global {
  var language: string;
  var i18nMessages: Record<string, string | { content: string }>;
}

export function configMessages(_local: string) {
  const local = getValidLocaleKey(_local);

  globalThis.language = local;

  if (local === 'zh-CN') {
    globalThis.i18nMessages = zhCN;
  }
  if (local === 'en-US') {
    globalThis.i18nMessages = enUS;
  }

  Object.keys(globalThis.i18nMessages).forEach((key) => {
    if (typeof globalThis.i18nMessages[key] !== 'string') {
      globalThis.i18nMessages[key] = globalThis.i18nMessages[key].content;
    }
  });
}
