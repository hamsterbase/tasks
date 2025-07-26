import React from 'react';
import { localize } from '@/nls';
import { MarkdownPage } from '../components/MarkdownPage';

const eulaContent = () => import('@/packages/docs/eula.en.md?raw');
const eulaContentZh = () => import('@/packages/docs/eula.zh.md?raw');

export const EULA: React.FC = () => {
  return (
    <MarkdownPage title={localize('login.eula', 'EULA')} loadContent={eulaContent} loadContentZh={eulaContentZh} />
  );
};
