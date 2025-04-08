import { StatusBar, Style } from '@capacitor/status-bar';
import { checkPlatform } from './checkPlatform';

export function getTheme() {
  const savedTheme = localStorage.getItem('theme') || 'auto';
  if (savedTheme === 'auto') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return mediaQuery.matches ? 'dark' : 'light';
  }
  return savedTheme;
}

const setThemeAndStatusBar = (theme: string) => {
  document.documentElement.dataset.theme = theme;

  if (checkPlatform().isNative) {
    StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
  }
};

export const initializeTheme = () => {
  const savedTheme = getTheme();
  setThemeAndStatusBar(savedTheme);
};

export function watchThemeChange() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    setThemeAndStatusBar(getTheme());
  });
}
