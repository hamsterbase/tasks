import { MarkdownPage } from '@/desktop/components/MarkdownPage';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { localize } from '@/nls';
import React from 'react';

const privacyContent = () => import('@/packages/docs/privacy.en.md?raw');
const privacyContentZh = () => import('@/packages/docs/privacy.zh.md?raw');

export const Privacy: React.FC = () => {
  return (
    <SettingsContent
      back={{
        to: '/desktop/settings/account',
        label: localize('account.title', 'Account'),
      }}
    >
      <MarkdownPage loadContent={privacyContent} loadContentZh={privacyContentZh} />
    </SettingsContent>
  );
};
