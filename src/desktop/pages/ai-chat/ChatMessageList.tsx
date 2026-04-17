import { BrainIcon, ChevronDownIcon, ChevronRightIcon, Loader2Icon, StopIcon, SyncIcon } from '@/components/icons';
import { localize } from '@/nls';
import type { ChatMessageItem, ContentBlock } from '@/services/ai/browser/types';
import React, { useState } from 'react';
import { UnifiedToolCard } from './UnifiedToolCard';

const AI_CHAT_CONTENT_WIDTH = 'w-full max-w-2xl mx-auto';

interface ChatMessageListProps {
  messages: ChatMessageItem[];
  isLoading?: boolean;
  onLinkMessage: (messageId: string) => void;
  onConfirmToolCall: (messageId: string, toolCallId: string) => void;
  onRejectToolCall: (messageId: string, toolCallId: string) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  onLinkMessage,
  onConfirmToolCall,
  onRejectToolCall,
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-t3">
        {localize('ai_chat.empty', 'Start a conversation with AI')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {messages.map((message, index) => (
        <ChatMessageItemComponent
          key={message.id}
          message={message}
          messageIndex={index + 1}
          messages={messages}
          isLastMessage={index === messages.length - 1}
          isLoading={isLoading}
          onLinkMessage={onLinkMessage}
          onConfirmToolCall={onConfirmToolCall}
          onRejectToolCall={onRejectToolCall}
        />
      ))}
    </div>
  );
};

interface ChatMessageItemComponentProps {
  message: ChatMessageItem;
  messageIndex: number;
  messages: ChatMessageItem[];
  isLastMessage: boolean;
  isLoading?: boolean;
  onLinkMessage: (messageId: string) => void;
  onConfirmToolCall: (messageId: string, toolCallId: string) => void;
  onRejectToolCall: (messageId: string, toolCallId: string) => void;
}

const ThinkingBlock: React.FC<{ text: string; isStreaming?: boolean }> = ({ text, isStreaming }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-md border border-line-light bg-bg2">
      <button
        onClick={() => setIsExpanded((value) => !value)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-t3 transition-colors hover:text-t1"
      >
        {isExpanded ? (
          <ChevronDownIcon className="size-3.5 flex-shrink-0" />
        ) : (
          <ChevronRightIcon className="size-3.5 flex-shrink-0" />
        )}
        <BrainIcon className="size-3.5 flex-shrink-0" />
        <span className="flex-1">{localize('ai_chat.thinking', 'Thinking')}</span>
        {isStreaming && <SyncIcon className="size-3.5 animate-spin flex-shrink-0" />}
      </button>
      {isExpanded && <pre className="px-3 pb-3 text-xs leading-5 text-t1 whitespace-pre-wrap break-words">{text}</pre>}
    </div>
  );
};

const getMessageStatus = (
  message: ChatMessageItem,
  isLastMessage: boolean,
  isLoading: boolean
): 'generating' | 'stopped' | null => {
  if (message.role !== 'assistant') {
    return null;
  }

  if (message.loading || (isLoading && isLastMessage)) {
    return 'generating';
  }

  if (message.aborted) {
    return 'stopped';
  }

  return null;
};

const MessageFooter: React.FC<{
  message: ChatMessageItem;
  messageIndex: number;
  isLastMessage: boolean;
  isLoading: boolean;
  onLinkMessage: (messageId: string) => void;
}> = ({ message, messageIndex, isLastMessage, isLoading, onLinkMessage }) => {
  const status = getMessageStatus(message, isLastMessage, isLoading);

  if (status === 'generating') {
    return (
      <span className="flex items-center gap-1 text-xs text-t3">
        <Loader2Icon className="size-3 animate-spin text-brand" />
        {localize('ai_chat.status_responding', 'Generating...')}
      </span>
    );
  }

  if (status === 'stopped') {
    return (
      <span className="flex items-center gap-1 text-xs text-t3">
        <StopIcon className="size-3" />
        {localize('ai_chat.status_stopped', 'Stopped')}
      </span>
    );
  }

  const handleLink = () => {
    onLinkMessage(message.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLink();
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleLink}
      onKeyDown={handleKeyDown}
      className="select-none text-xs text-t3 transition-colors hover:text-t1"
      title={localize('ai_chat.reply_to_this', 'Reply to this')}
    >
      #{messageIndex}
    </span>
  );
};

const getMessageTextById = (messages: ChatMessageItem[], messageId?: string) => {
  if (!messageId) {
    return '';
  }

  const target = messages.find((item) => item.id === messageId);
  if (!target) {
    return '';
  }

  return target.contentBlocks
    .filter((block): block is Extract<ContentBlock, { type: 'text' }> => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
};

const ContentBlockRenderer: React.FC<{
  block: ContentBlock;
  messageId: string;
  onConfirmToolCall: (messageId: string, toolCallId: string) => void;
  onRejectToolCall: (messageId: string, toolCallId: string) => void;
}> = ({ block, messageId, onConfirmToolCall, onRejectToolCall }) => {
  if (block.type === 'text') {
    return <p className="text-sm leading-5 text-t1 whitespace-pre-wrap">{block.text}</p>;
  }

  if (block.type === 'thinking') {
    return <ThinkingBlock text={block.text} isStreaming={block.isStreaming} />;
  }

  if (block.type === 'tool_call') {
    return (
      <UnifiedToolCard
        toolCall={block.toolCall}
        onConfirm={() => onConfirmToolCall(messageId, block.toolCall.id)}
        onReject={() => onRejectToolCall(messageId, block.toolCall.id)}
      />
    );
  }

  return null;
};

const ChatMessageItemComponent: React.FC<ChatMessageItemComponentProps> = ({
  message,
  messageIndex,
  messages,
  isLastMessage,
  isLoading,
  onLinkMessage,
  onConfirmToolCall,
  onRejectToolCall,
}) => {
  const isUser = message.role === 'user';
  const linkedQuote = getMessageTextById(messages, message.linkedMessageId);

  return (
    <div
      className={
        isUser
          ? `${AI_CHAT_CONTENT_WIDTH} flex flex-col items-end gap-1`
          : `${AI_CHAT_CONTENT_WIDTH} flex flex-col items-start gap-1`
      }
    >
      {isUser ? (
        <div className="flex max-w-full flex-col gap-1 rounded-xl bg-bg3 px-3 py-2 text-sm leading-5 text-t1">
          {linkedQuote && (
            <span className="line-clamp-2 border-l-2 border-brand pl-2 text-xs leading-5 text-t3">{linkedQuote}</span>
          )}
          {message.contentBlocks.map((block, index) => (
            <ContentBlockRenderer
              key={index}
              block={block}
              messageId={message.id}
              onConfirmToolCall={onConfirmToolCall}
              onRejectToolCall={onRejectToolCall}
            />
          ))}
        </div>
      ) : (
        <div className="flex max-w-full flex-col gap-2 text-sm leading-5 text-t1">
          {message.contentBlocks.map((block, index) => (
            <ContentBlockRenderer
              key={index}
              block={block}
              messageId={message.id}
              onConfirmToolCall={onConfirmToolCall}
              onRejectToolCall={onRejectToolCall}
            />
          ))}
        </div>
      )}
      {!isUser && (
        <MessageFooter
          message={message}
          messageIndex={messageIndex}
          isLastMessage={isLastMessage}
          isLoading={isLoading ?? false}
          onLinkMessage={onLinkMessage}
        />
      )}
    </div>
  );
};
