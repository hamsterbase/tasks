import { RepeatIcon, ChevronDownIcon, ChevronRightIcon, BrainIcon } from '@/components/icons';
import { localize } from '@/nls';
import React, { useState } from 'react';
import { ChatMessageItem, ContentBlock } from '@/services/ai/browser/types';
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
      <div className="flex items-center justify-center h-full text-t3">
        {localize('ai_chat.empty', 'Start a conversation with AI')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <ChatMessageItemComponent
          key={message.id}
          message={message}
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
  isLastMessage: boolean;
  isLoading?: boolean;
  onLinkMessage: (messageId: string) => void;
  onConfirmToolCall: (messageId: string, toolCallId: string) => void;
  onRejectToolCall: (messageId: string, toolCallId: string) => void;
}

const ThinkingBlock: React.FC<{ text: string; isStreaming?: boolean }> = ({ text, isStreaming }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="my-2 border border-line-light rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-bg2 hover:bg-bg3 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDownIcon className="size-4 text-t3 flex-shrink-0" />
          ) : (
            <ChevronRightIcon className="size-4 text-t3 flex-shrink-0" />
          )}
          <BrainIcon className="size-4 text-t2" />
          <span className="text-sm text-t2">{localize('ai_chat.thinking', 'Thinking')}</span>
          {isStreaming && (
            <span className="inline-flex items-center">
              <span className="animate-pulse text-t3">...</span>
            </span>
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="p-3 border-t border-line-light bg-bg1">
          <div className="text-sm text-t2 whitespace-pre-wrap font-mono select-text">{text}</div>
        </div>
      )}
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

  if (isLoading && isLastMessage) {
    return 'generating';
  }

  if (message.aborted) {
    return 'stopped';
  }

  return null;
};

interface MessageStatusBadgeProps {
  status: 'generating' | 'stopped';
}

const MessageStatusBadge: React.FC<MessageStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    generating: {
      text: localize('ai_chat.status_generating', 'Generating'),
      className: 'text-brand',
      icon: <span className="animate-pulse">●</span>,
    },
    stopped: {
      text: localize('ai_chat.status_stopped', 'Stopped'),
      className: 'text-t3',
      icon: '■',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`text-xs ml-2 ${config.className}`}>
      {config.icon} {config.text}
    </span>
  );
};

const ContentBlockRenderer: React.FC<{
  block: ContentBlock;
  messageId: string;
  onConfirmToolCall: (messageId: string, toolCallId: string) => void;
  onRejectToolCall: (messageId: string, toolCallId: string) => void;
}> = ({ block, messageId, onConfirmToolCall, onRejectToolCall }) => {
  if (block.type === 'text') {
    return <div className="whitespace-pre-wrap select-text">{block.text}</div>;
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
  isLastMessage,
  isLoading,
  onLinkMessage,
  onConfirmToolCall,
  onRejectToolCall,
}) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={isUser ? 'min-w-[200px] max-w-2xl' : 'w-[80%]'}>
        <div className={`rounded-lg p-3 ${isUser ? 'bg-brand text-white' : 'bg-bg2 text-t1'}`}>
          <div className="text-xs opacity-70 mb-1 flex items-center">
            <span>
              #{message.id}
              {message.linkedMessageId && ` → #${message.linkedMessageId}`}
            </span>
            {!isUser &&
              (() => {
                const status = getMessageStatus(message, isLastMessage, isLoading ?? false);
                return status ? <MessageStatusBadge status={status} /> : null;
              })()}
          </div>
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
        {!isUser && (
          <button
            onClick={() => onLinkMessage(message.id)}
            className="mt-1 p-1 text-t3 hover:bg-bg3 rounded transition-colors"
            title={localize('ai_chat.reply_to_this', 'Reply to this')}
          >
            <RepeatIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
};
