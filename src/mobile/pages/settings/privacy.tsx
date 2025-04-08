import React, { Suspense } from 'react';
import { localize } from '@/nls';
import styles from './privacy.module.css';
import { PageLayout } from '@/mobile/components/PageLayout';
import classnames from 'classnames';
const ReactMarkdown = React.lazy(() => import('react-markdown'));
const privacyContent = () => import('@/packages/docs/privacy.en.md?raw');
const privacyContentZh = () => import('@/packages/docs/privacy.zh.md?raw');

export const PrivacyPage: React.FC = () => {
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
    <PageLayout
      bottomMenu={{
        left: 'back',
      }}
    >
      <div className={classnames(styles.privacy, 'p-4 bg-bg1 text-t1')}>
        <Suspense fallback={<div>{localize('common.loading', 'Loading...')}</div>}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </Suspense>
      </div>
    </PageLayout>
  );
};
