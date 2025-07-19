import React, { Suspense } from 'react';
import { localize } from '@/nls';

const ReactMarkdown = React.lazy(() => import('react-markdown'));
const eulaContent = () => import('@/packages/docs/eula.en.md?raw');
const eulaContentZh = () => import('@/packages/docs/eula.zh.md?raw');

export const EULA: React.FC = () => {
  const [content, setContent] = React.useState('');

  React.useEffect(() => {
    if (globalThis.language === 'zh-CN') {
      eulaContentZh().then((module) => {
        setContent(module.default);
      });
    } else {
      eulaContent().then((module) => {
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
