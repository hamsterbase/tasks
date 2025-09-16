import {
  calculateScrollPosition,
  findTextPositionFromCoordinates,
} from '@/base/browser/findTextPositionFromCoordinates';
import { useConfig } from '@/hooks/useConfig';
import { localize } from '@/nls';
import { notesMarkdownRenderConfigKey } from '@/services/config/config';
import { desktopStyles } from '@/desktop/theme/main';
import TextArea, { TextAreaRef } from 'rc-textarea';
import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import ReactMarkdown from 'react-markdown';

interface NotesFieldProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const NotesField: React.FC<NotesFieldProps> = ({
  value,
  onSave,
  placeholder = localize('notes_placeholder', 'Add notes...'),
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(value);
  const textAreaRef = useRef<TextAreaRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { value: notesMarkdownRender } = useConfig(notesMarkdownRenderConfigKey());

  useEffect(() => {
    setTextValue(value);
  }, [value]);

  const hasNotes = value && value.trim().length > 0;

  const handleMarkdownClick = (e: React.MouseEvent) => {
    const position = findTextPositionFromCoordinates({
      x: e.clientX,
      y: e.clientY,
      originalText: value,
    });
    const containerWidth = containerRef.current?.clientWidth || 310;
    const scrollTop = calculateScrollPosition({
      position,
      value,
      width: `${containerWidth}px`,
      className,
    });
    flushSync(() => {
      setIsEditing(true);
      setTextValue(value);
    });
    if (textAreaRef.current && textAreaRef.current.resizableTextArea?.textArea) {
      const textArea = textAreaRef.current.resizableTextArea.textArea;
      textAreaRef.current.focus();
      textArea.setSelectionRange(position, position);
      if (containerRef.current) {
        containerRef.current?.scrollTo({ top: scrollTop - 50, behavior: 'instant' });
      }
    }
  };

  const handleBlur = () => {
    onSave(textValue);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
  };

  return (
    <div ref={containerRef} className={desktopStyles.NotesFieldContainer}>
      {!hasNotes || isEditing || !notesMarkdownRender ? (
        <TextArea
          ref={textAreaRef}
          value={textValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={className}
          style={{ width: '100%' }}
          placeholder={placeholder}
          autoSize={{ minRows: 1 }}
        />
      ) : (
        <div className={className} onClick={handleMarkdownClick}>
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
            {value}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};
