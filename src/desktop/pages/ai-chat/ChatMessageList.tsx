import { BrainIcon, ChevronDownIcon, ChevronRightIcon, Loader2Icon, StopIcon, SyncIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import type { ChatMessageItem, ContentBlock } from '@/services/ai/browser/types';
import React, { useState } from 'react';
import { UnifiedToolCard } from './UnifiedToolCard';

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
      <div className={desktopStyles.AIChatMessageListEmpty}>
        {localize('ai_chat.empty', 'Start a conversation with AI')}
      </div>
    );
  }

  return (
    <div className={desktopStyles.AIChatMessageList}>
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
    <div className={desktopStyles.AIChatThinkingBlock}>
      <button onClick={() => setIsExpanded((value) => !value)} className={desktopStyles.AIChatThinkingToggle}>
        {isExpanded ? (
          <ChevronDownIcon className={desktopStyles.AIChatThinkingIcon} />
        ) : (
          <ChevronRightIcon className={desktopStyles.AIChatThinkingIcon} />
        )}
        <BrainIcon className={desktopStyles.AIChatThinkingIcon} />
        <span className={desktopStyles.AIChatThinkingLabel}>{localize('ai_chat.thinking', 'Thinking')}</span>
        {isStreaming && <SyncIcon className={desktopStyles.AIChatThinkingStreamingIcon} />}
      </button>
      {isExpanded && <pre className={desktopStyles.AIChatThinkingContent}>{text}</pre>}
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
      <span className={desktopStyles.AIChatMessageFooterStatus}>
        <Loader2Icon className={desktopStyles.AIChatMessageFooterLoadingIcon} />
        {localize('ai_chat.status_responding', 'Generating...')}
      </span>
    );
  }

  if (status === 'stopped') {
    return (
      <span className={desktopStyles.AIChatMessageFooterStatus}>
        <StopIcon className={desktopStyles.AIChatMessageFooterStoppedIcon} />
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
      className={desktopStyles.AIChatMessageReplyButton}
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
    return <p className={desktopStyles.AIChatMessageText}>{block.text}</p>;
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
    <div className={isUser ? desktopStyles.AIChatMessageContainerUser : desktopStyles.AIChatMessageContainerAssistant}>
      {isUser ? (
        <div className={desktopStyles.AIChatMessageUserBubble}>
          {linkedQuote && <span className={desktopStyles.AIChatMessageLinkedQuote}>{linkedQuote}</span>}
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
        <div className={desktopStyles.AIChatMessageAssistantContent}>
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
