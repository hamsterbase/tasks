import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import React from 'react';
import { SettingsIcon } from '../../../components/icons';
import { localize } from '../../../nls';
import { PageLayout } from '../../components/PageLayout';

export const LanguageSettings = () => {
  const currentLanguage = globalThis.language;

  const changeLanguage = (lang: string) => {
    localStorage.setItem('language', lang);
    window.location.reload();
  };

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'language',
        title: localize('settings.language', 'Language'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <ListItemGroup
        items={[
          {
            title: localize('settings.language.english', 'English'),
            mode: {
              type: 'check',
              checked: currentLanguage === 'en-US',
            },
            onClick: () => changeLanguage('en'),
          },
          {
            title: '简体中文',
            mode: {
              type: 'check',
              checked: currentLanguage === 'zh-CN',
            },
            onClick: () => changeLanguage('zh'),
          },
        ]}
      />
    </PageLayout>
  );
};
