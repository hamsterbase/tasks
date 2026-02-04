import { SettingsIcon } from '@/components/icons';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { PageLayout } from '@/mobile/components/PageLayout.tsx';
import { localize } from '@/nls.ts';
import React, { useState } from 'react';

export const ThemeSettings = () => {
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');

  const changeTheme = (theme: string) => {
    localStorage.setItem('theme', theme);
    setCurrentTheme(theme);
    window.location.reload();
  };

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'theme',
        title: localize('settings.theme', 'Theme'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <ListItemGroup
        items={[
          {
            title: localize('settings.theme.light', 'Light'),
            mode: {
              type: 'check',
              checked: currentTheme === 'light',
            },
            onClick: () => changeTheme('light'),
          },
          {
            title: localize('settings.theme.dark', 'Dark'),
            mode: {
              type: 'check',
              checked: currentTheme === 'dark',
            },
            onClick: () => changeTheme('dark'),
          },
          {
            title: localize('settings.theme.eink', 'E-Ink'),
            mode: {
              type: 'check',
              checked: currentTheme === 'eink',
            },
            onClick: () => changeTheme('eink'),
          },
          {
            title: localize('settings.theme.auto', 'Auto (System)'),
            mode: {
              type: 'check',
              checked: currentTheme === 'auto',
            },
            onClick: () => changeTheme('auto'),
          },
        ]}
      />
    </PageLayout>
  );
};
