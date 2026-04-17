import { CloseIcon, SendIcon, StopIcon } from '@/components/icons';
import { localize } from '@/nls';
import type { ChatMessageItem, TextContentBlock } from '@/services/ai/browser/types';
import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router';

const AI_CHAT_CONTENT_WIDTH = 'w-full max-w-2xl mx-auto';

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
      <div className="px-6 pb-6">
        <div
          className={`${AI_CHAT_CONTENT_WIDTH} rounded-xl border border-line-light bg-bg2 px-4 py-3 text-center text-sm text-t3`}
        >
          {localize('ai_chat.not_configured', 'Please configure your AI API settings first')}
          <Link to="/desktop/settings/ai" className="ml-1 text-brand hover:underline">
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
    <div className="px-6 pb-6">
      <div
        className={`${AI_CHAT_CONTENT_WIDTH} flex flex-col gap-2 rounded-xl border border-line-light bg-bg2 px-3 py-2 transition-colors focus-within:border-line-bold`}
      >
        {linkedMessage && (
          <div className="flex items-start gap-2 py-1 text-xs text-t2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 border-l-2 border-brand pl-2">
              <span className="text-xs text-brand">
                {localize('ai_chat.replying_to_message', 'Reply #{0}', linkedMessageIndex ?? linkedMessage.id)}
              </span>
              <span className="line-clamp-2 text-xs leading-5 text-t3">{linkedMessageText}</span>
            </div>
            <button
              onClick={onClearLink}
              className="flex size-4 flex-shrink-0 items-center justify-center rounded-sm text-t3 transition-colors hover:bg-bg3 hover:text-t1"
            >
              <CloseIcon className="size-3" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2">
            <textarea
              ref={textAreaRef}
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              onInput={(event) => resizeTextArea(event.currentTarget)}
              placeholder={localize('ai_chat.placeholder', 'Type your message...')}
              className="min-h-6 max-h-32 flex-1 resize-none overflow-y-auto border-none bg-transparent px-0 py-0 text-sm leading-5 text-t1 outline-none placeholder:text-t3"
              disabled={isLoading}
            />
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="flex size-7 flex-shrink-0 items-center justify-center rounded-md bg-brand text-white transition-opacity hover:opacity-90"
              >
                <StopIcon className="size-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex size-7 flex-shrink-0 items-center justify-center rounded-md bg-brand text-white transition-opacity hover:opacity-90"
              >
                <SendIcon className="size-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
