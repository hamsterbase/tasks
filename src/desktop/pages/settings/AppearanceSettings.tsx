import { localize } from '@/nls';
import React, { useState } from 'react';
import { SettingsItem } from '@/desktop/components/settings/SettingsItem';

export const AppearanceSettings: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
  const [currentLanguage] = useState(globalThis.language || 'en-US');

  const changeTheme = (theme: string) => {
    localStorage.setItem('theme', theme);
    setCurrentTheme(theme);
    window.location.reload();
  };

  const changeLanguage = (lang: string) => {
    localStorage.setItem('language', lang);
    window.location.reload();
  };

  const getLanguageValue = (locale: string) => {
    switch (locale) {
      case 'en-US':
        return 'en';
      case 'zh-CN':
        return 'zh';
      default:
        return 'en';
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="space-y-8">
        <SettingsItem
          title={localize('settings.theme', 'Theme')}
          description={localize('settings.theme.description', 'Select your preferred theme.')}
          action={{
            type: 'select',
            options: [
              { value: 'light', label: localize('settings.theme.light', 'Light') },
              { value: 'dark', label: localize('settings.theme.dark', 'Dark') },
              { value: 'eink', label: localize('settings.theme.eink', 'E-Ink') },
              { value: 'auto', label: localize('settings.theme.auto', 'Auto (System)') },
            ],
            currentValue: currentTheme,
            onChange: changeTheme,
          }}
        />

        <SettingsItem
          title={localize('settings.language', 'Language')}
          description={localize('settings.language.description', 'Select your preferred language.')}
          action={{
            type: 'select',
            options: [
              { value: 'en', label: localize('settings.language.english', 'English') },
              { value: 'zh', label: '简体中文' },
            ],
            currentValue: getLanguageValue(currentLanguage),
            onChange: changeLanguage,
          }}
        />
      </div>
    </div>
  );
};
