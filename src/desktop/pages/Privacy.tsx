import React from 'react';
import { localize } from '@/nls';
import { MarkdownPage } from '../components/MarkdownPage';

const privacyContent = () => import('@/packages/docs/privacy.en.md?raw');
const privacyContentZh = () => import('@/packages/docs/privacy.zh.md?raw');

export const Privacy: React.FC = () => {
  return (
    <MarkdownPage
      title={localize('login.privacyPolicy', 'Privacy Policy')}
      loadContent={privacyContent}
      loadContentZh={privacyContentZh}
    />
  );
};
