import React from 'react';
import ReactMarkdown from 'react-markdown';
import { desktopStyles } from '@/desktop/theme/main';

export const NotesMarkdown: React.FC<{ children: string }> = ({ children }) => (
  <ReactMarkdown
    components={{
      h1: ({ children }) => <h1 className={desktopStyles.NotesMarkdownH1}>{children}</h1>,
      h2: ({ children }) => <h2 className={desktopStyles.NotesMarkdownH2}>{children}</h2>,
      h3: ({ children }) => <h3 className={desktopStyles.NotesMarkdownH3}>{children}</h3>,
      h4: ({ children }) => <h4 className={desktopStyles.NotesMarkdownH4}>{children}</h4>,
      p: ({ children }) => <p className={desktopStyles.NotesMarkdownP}>{children}</p>,
      ol: ({ children }) => <ol className={desktopStyles.NotesMarkdownOl}>{children}</ol>,
      ul: ({ children }) => <ul className={desktopStyles.NotesMarkdownUl}>{children}</ul>,
      li: ({ children }) => <li className={desktopStyles.NotesMarkdownLi}>{children}</li>,
      a: ({ children, href }) => (
        <a
          href={href}
          className={desktopStyles.NotesMarkdownLink}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </a>
      ),
      blockquote: ({ children }) => (
        <blockquote className={desktopStyles.NotesMarkdownBlockquote}>{children}</blockquote>
      ),
      code: ({ children }) => <code className={desktopStyles.NotesMarkdownCode}>{children}</code>,
      pre: ({ children }) => <pre className={desktopStyles.NotesMarkdownPre}>{children}</pre>,
    }}
  >
    {children}
  </ReactMarkdown>
);
