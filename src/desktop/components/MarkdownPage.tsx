import React, { Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { localize } from '@/nls';

const ReactMarkdown = React.lazy(() => import('react-markdown'));

interface MarkdownPageProps {
  title: string;
  loadContent: () => Promise<{ default: string }>;
  loadContentZh?: () => Promise<{ default: string }>;
}

export const MarkdownPage: React.FC<MarkdownPageProps> = ({ title, loadContent, loadContentZh }) => {
  const navigate = useNavigate();
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

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-bg1">
      <div className="sticky top-0 pt-10 bg-bg1 border-b border-line-light px-6 py-4 flex items-center gap-4">
        <button onClick={handleBack} className="text-t2 hover:text-t1 transition-colors flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {localize('common.back', 'Back')}
        </button>
        <h1 className="text-xl font-medium text-t1">{title}</h1>
      </div>
      <div className="p-6 max-w-4xl mx-auto text-t1">
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
      </div>
    </div>
  );
};
