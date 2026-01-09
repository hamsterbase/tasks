import { ArrowUpIcon, CloseIcon, RepeatIcon, StopIcon } from '@/components/icons';
import { localize } from '@/nls';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { ChatMessageItem, TextContentBlock } from '@/services/ai/browser/types';
import TextArea from 'rc-textarea';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  linkedMessage?: ChatMessageItem;
  onClearLink: () => void;
  isConfigured: boolean;
  onStop?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  linkedMessage,
  onClearLink,
  isConfigured,
  onStop,
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() && !isLoading && isConfigured) {
        onSendMessage(input);
        setInput('');
      }
    },
    [input, isLoading, isConfigured, onSendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  if (!isConfigured) {
    return (
      <div className="p-4">
        <div className="text-center text-t3">
          {localize('ai_chat.not_configured', 'Please configure your AI API settings first')}
          <Link to="/desktop/settings/ai" className="text-brand hover:underline ml-1">
            {localize('ai_chat.go_to_settings', 'Go to Settings')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {linkedMessage &&
        (() => {
          const textContent = linkedMessage.contentBlocks
            .filter((block): block is TextContentBlock => block.type === 'text')
            .map((block) => block.text)
            .join('\n');
          return (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-bg2 rounded-lg">
              <RepeatIcon className="size-4 text-t3" />
              <span className="text-sm text-t2 font-medium">#{linkedMessage.id}</span>
              <span className="flex-1 text-sm text-t2 truncate">
                {textContent.slice(0, 50)}
                {textContent.length > 50 && '...'}
              </span>
              <button onClick={onClearLink} className="text-t3 hover:text-t1 transition-colors">
                <CloseIcon className="size-4" />
              </button>
            </div>
          );
        })()}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={localize('ai_chat.placeholder', 'Type your message...')}
            className="w-full px-3 py-3 pr-14 border border-line-regular rounded-lg bg-bg1 text-t1 placeholder-t3 focus:outline-none focus:border-brand resize-none"
            autoSize={{ minRows: 2, maxRows: 6 }}
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="absolute right-3 bottom-4 w-8 h-8 rounded-full bg-brand flex items-center justify-center hover:bg-brand/90 transition-colors"
            >
              <StopIcon className="size-4 text-text-white" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-3 bottom-4 w-8 h-8 rounded-full bg-brand flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand/90 transition-colors"
            >
              <ArrowUpIcon className="size-4 text-text-white" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
