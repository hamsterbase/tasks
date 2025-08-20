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
    <Suspense fallback={<div className="text-t2">{localize('common.loading', 'Loading...')}</div>}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-medium text-t1 mb-4 mt-6">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-medium text-t1 mb-3 mt-5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium text-t1 mb-2 mt-4">{children}</h3>,
          p: ({ children }) => <p className="text-t1 mb-4 leading-relaxed">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-accent no-underline hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="text-t1 font-medium">{children}</strong>,
          ul: ({ children }) => <ul className="text-t1 my-4 list-disc pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="text-t1 my-4 list-decimal pl-6">{children}</ol>,
          li: ({ children }) => <li className="my-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="text-t2 border-l-4 border-line-light pl-4 my-4">{children}</blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Suspense>
  );
};
