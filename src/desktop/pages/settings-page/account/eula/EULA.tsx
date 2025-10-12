import { MarkdownPage } from '@/desktop/components/MarkdownPage';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { localize } from '@/nls';
import React from 'react';

const eulaContent = () => import('@/packages/docs/eula.en.md?raw');
const eulaContentZh = () => import('@/packages/docs/eula.zh.md?raw');

export const EULA: React.FC = () => {
  return (
    <SettingsContent
      back={{
        to: '/desktop/settings/account',
        label: localize('account.title', 'Account'),
      }}
    >
      <MarkdownPage loadContent={eulaContent} loadContentZh={eulaContentZh} />
    </SettingsContent>
  );
};
