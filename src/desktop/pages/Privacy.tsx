import React, { Suspense } from 'react';
import { localize } from '@/nls';

const ReactMarkdown = React.lazy(() => import('react-markdown'));
const privacyContent = () => import('@/packages/docs/privacy.en.md?raw');
const privacyContentZh = () => import('@/packages/docs/privacy.zh.md?raw');

export const Privacy: React.FC = () => {
  const [content, setContent] = React.useState('');

  React.useEffect(() => {
    if (globalThis.language === 'zh-CN') {
      privacyContentZh().then((module) => {
        setContent(module.default);
      });
    } else {
      privacyContent().then((module) => {
        setContent(module.default);
      });
    }
  }, []);

  return (
    <div className="p-6 bg-bg1 text-t1 min-h-screen">
      <Suspense fallback={<div>{localize('common.loading', 'Loading...')}</div>}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </Suspense>
    </div>
  );
};
