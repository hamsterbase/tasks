import {
  calculateScrollPosition,
  findTextPositionFromCoordinates,
} from '@/base/browser/findTextPositionFromCoordinates';
import { useConfig } from '@/hooks/useConfig';
import { useService } from '@/hooks/use-service';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { localize } from '@/nls';
import { IAttachmentUploadService } from '@/services/attachment/common/attachmentUploadService';
import { notesMarkdownRenderConfigKey } from '@/services/config/config';
import { desktopStyles } from '@/desktop/theme/main';
import TextArea, { TextAreaRef } from 'rc-textarea';
import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { NotesMarkdown } from '@/desktop/components/NotesMarkdown';

interface NotesFieldProps {
  parentUid?: string;
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
}

export const NotesField: React.FC<NotesFieldProps> = ({
  parentUid,
  value,
  onSave,
  placeholder = localize('notes_placeholder', 'Add notes...'),
  className,
}) => {
  const attachmentService = useService(IAttachmentUploadService);
  const showMessage = useDesktopMessage();
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

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!parentUid) return;
    const images = Array.from(e.clipboardData.files).filter((file) => file.type.startsWith('image/'));
    if (images.length === 0) return;

    e.preventDefault();
    if (!attachmentService.getConfig()) {
      showMessage({
        type: 'error',
        message: localize('attachments.pasteNotConfigured', 'Set up S3 storage in Settings before pasting images.'),
      });
      return;
    }
    attachmentService.uploadFiles(images, parentUid);
  };

  return (
    <div ref={containerRef} className={desktopStyles.NotesFieldContainer}>
      {!hasNotes || isEditing || !notesMarkdownRender ? (
        <TextArea
          ref={textAreaRef}
          value={textValue}
          onChange={handleChange}
          onPaste={handlePaste}
          onBlur={handleBlur}
          className={className}
          style={{ width: '100%' }}
          placeholder={placeholder}
          autoSize={{ minRows: 3 }}
        />
      ) : (
        <div className={className} onClick={handleMarkdownClick}>
          <NotesMarkdown>{value}</NotesMarkdown>
        </div>
      )}
    </div>
  );
};
