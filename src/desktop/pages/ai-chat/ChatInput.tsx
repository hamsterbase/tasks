import { CloseIcon, SendIcon, StopIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import type { ChatMessageItem, TextContentBlock } from '@/services/ai/browser/types';
import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  linkedMessage?: ChatMessageItem;
  linkedMessageIndex?: number;
  onClearLink: () => void;
  isConfigured: boolean;
  onStop?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  linkedMessage,
  linkedMessageIndex,
  onClearLink,
  isConfigured,
  onStop,
}) => {
  const [input, setInput] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextArea = useCallback((element: HTMLTextAreaElement) => {
    element.style.height = '0px';
    element.style.height = `${Math.min(element.scrollHeight, 128)}px`;
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!input.trim() || isLoading || !isConfigured) {
        return;
      }

      onSendMessage(input);
      setInput('');
      if (textAreaRef.current) {
        textAreaRef.current.style.height = '';
      }
    },
    [input, isLoading, isConfigured, onSendMessage]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit(event);
      }
    },
    [handleSubmit]
  );

  if (!isConfigured) {
    return (
      <div className={desktopStyles.AIChatInputOuter}>
        <div className={`${desktopStyles.AIChatContentWidth} ${desktopStyles.AIChatInputNotice}`}>
          {localize('ai_chat.not_configured', 'Please configure your AI API settings first')}
          <Link to="/desktop/settings/ai" className={desktopStyles.AIChatInputNoticeLink}>
            {localize('ai_chat.go_to_settings', 'Go to Settings')}
          </Link>
        </div>
      </div>
    );
  }

  const linkedMessageText = linkedMessage
    ? linkedMessage.contentBlocks
        .filter((block): block is TextContentBlock => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
    : '';

  return (
    <div className={desktopStyles.AIChatInputOuter}>
      <div className={`${desktopStyles.AIChatContentWidth} ${desktopStyles.AIChatInputContainer}`}>
        {linkedMessage && (
          <div className={desktopStyles.AIChatInputLinkedRow}>
            <div className={desktopStyles.AIChatInputLinkedContent}>
              <span className={desktopStyles.AIChatInputLinkedLabel}>
                {localize('ai_chat.replying_to_message', 'Reply #{0}', linkedMessageIndex ?? linkedMessage.id)}
              </span>
              <span className={desktopStyles.AIChatInputLinkedText}>{linkedMessageText}</span>
            </div>
            <button onClick={onClearLink} className={desktopStyles.AIChatInputLinkedClearButton}>
              <CloseIcon className={desktopStyles.AIChatInputLinkedClearIcon} />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={desktopStyles.AIChatInputFormRow}>
            <textarea
              ref={textAreaRef}
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              onInput={(event) => resizeTextArea(event.currentTarget)}
              placeholder={localize('ai_chat.placeholder', 'Type your message...')}
              className={desktopStyles.AIChatInputTextarea}
              disabled={isLoading}
            />
            {isLoading ? (
              <button type="button" onClick={onStop} className={desktopStyles.AIChatInputSubmitButton}>
                <StopIcon className={desktopStyles.AIChatInputSubmitIcon} />
              </button>
            ) : (
              <button type="submit" className={desktopStyles.AIChatInputSubmitButton}>
                <SendIcon className={desktopStyles.AIChatInputSubmitIcon} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
