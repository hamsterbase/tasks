import React, { Suspense } from 'react';
import { localize } from '@/nls';
import styles from './eula.module.css';
import { PageLayout } from '@/mobile/components/PageLayout';
import classnames from 'classnames';

const ReactMarkdown = React.lazy(() => import('react-markdown'));
const eulaContent = () => import('@/packages/docs/eula.en.md?raw');
const eulaContentZh = () => import('@/packages/docs/eula.zh.md?raw');

export const EULAPage: React.FC = () => {
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
    <PageLayout
      bottomMenu={{
        left: 'back',
      }}
    >
      <div className={classnames(styles.eula, 'p-4 bg-bg1 text-t1')}>
        <Suspense fallback={<div>{localize('common.loading', 'Loading...')}</div>}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </Suspense>
      </div>
    </PageLayout>
  );
};
