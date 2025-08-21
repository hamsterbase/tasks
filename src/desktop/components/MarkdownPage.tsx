import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import React, { Suspense, useEffect, useState } from 'react';

const ReactMarkdown = React.lazy(() => import('react-markdown'));

interface MarkdownPageProps {
  loadContent: () => Promise<{ default: string }>;
  loadContentZh?: () => Promise<{ default: string }>;
}

export const MarkdownPage: React.FC<MarkdownPageProps> = ({ loadContent, loadContentZh }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (globalThis.language === 'zh-CN' && loadContentZh) {
      loadContentZh().then((module) => {
        setContent(module.default);
      });
    } else {
      loadContent().then((module) => {
        setContent(module.default);
      });
    }
  }, [loadContent, loadContentZh]);

  return (
    <Suspense
      fallback={<div className={desktopStyles.MarkdownPageLoading}>{localize('common.loading', 'Loading...')}</div>}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className={desktopStyles.MarkdownPageH1}>{children}</h1>,
          h2: ({ children }) => <h2 className={desktopStyles.MarkdownPageH2}>{children}</h2>,
          h3: ({ children }) => <h3 className={desktopStyles.MarkdownPageH3}>{children}</h3>,
          p: ({ children }) => <p className={desktopStyles.MarkdownPageP}>{children}</p>,
          a: ({ href, children }) => (
            <a href={href} className={desktopStyles.MarkdownPageLink} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className={desktopStyles.MarkdownPageStrong}>{children}</strong>,
          ul: ({ children }) => <ul className={desktopStyles.MarkdownPageUl}>{children}</ul>,
          ol: ({ children }) => <ol className={desktopStyles.MarkdownPageOl}>{children}</ol>,
          li: ({ children }) => <li className={desktopStyles.MarkdownPageLi}>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className={desktopStyles.MarkdownPageBlockquote}>{children}</blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Suspense>
  );
};
