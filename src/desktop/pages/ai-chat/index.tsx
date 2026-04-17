import { AIIcon, RotateCcwIcon } from '@/components/icons';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IAIService } from '@/services/ai/common/aiService';
import React, { useCallback } from 'react';
import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import { useAutoScroll } from './useAutoScroll';

export const AIChat: React.FC = () => {
  const aiService = useService(IAIService);
  const controller = aiService.chatController;
  const linkedMessageIndex = controller.linkedMessage
    ? (() => {
        const index = controller.session.messages.findIndex((message) => message.id === controller.linkedMessage?.id);
        return index >= 0 ? index + 1 : undefined;
      })()
    : undefined;

  useWatchEvent(controller.onStateChange);

  const { scrollContainerRef } = useAutoScroll({
    onStateChange: controller.onStateChange,
    isLoading: controller.isLoading,
    threshold: 100,
  });

  const handleSendMessage = useCallback(
    async (content: string) => {
      await controller.sendMessage(content);
    },
    [controller]
  );

  const handleLinkMessage = useCallback(
    (messageId: string) => {
      controller.linkMessage(messageId);
    },
    [controller]
  );

  const handleClearLink = useCallback(() => {
    controller.clearLink();
  }, [controller]);

  const handleConfirmToolCall = useCallback(
    (messageId: string, toolCallId: string) => {
      controller.confirmToolCall(messageId, toolCallId);
    },
    [controller]
  );

  const handleRejectToolCall = useCallback(
    (messageId: string, toolCallId: string) => {
      controller.rejectToolCall(messageId, toolCallId);
    },
    [controller]
  );

  const handleClearChat = useCallback(() => {
    controller.clearChat();
  }, [controller]);

  const handleStop = useCallback(() => {
    controller.stopGeneration();
  }, [controller]);

  return (
    <div className="flex h-full w-full flex-col bg-bg1">
      <div className="h-11 flex items-center justify-between bg-bg1 px-5 pr-3 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="size-5 flex items-center justify-center text-t2">
            <button className="size-5 flex items-center justify-center">
              <AIIcon className="size-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="group flex items-center gap-1 flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-t1 truncate">{localize('ai_chat', 'AI Chat')}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 px-2 text-xs text-t2 rounded-md transition-colors h-7 cursor-pointer"
          >
            <span className="size-3.5 flex items-center justify-center">
              <RotateCcwIcon className="size-3.5" strokeWidth={1.5} />
            </span>
            <span className="text-xs leading-5 font-normal">{localize('ai_chat.new_chat', 'New Chat')}</span>
          </button>
        </div>
      </div>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-6">
        <ChatMessageList
          messages={controller.session.messages}
          isLoading={controller.isLoading}
          onLinkMessage={handleLinkMessage}
          onConfirmToolCall={handleConfirmToolCall}
          onRejectToolCall={handleRejectToolCall}
        />
      </div>
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={controller.isLoading}
        linkedMessage={controller.linkedMessage}
        linkedMessageIndex={linkedMessageIndex}
        onClearLink={handleClearLink}
        isConfigured={controller.isConfigured()}
        onStop={handleStop}
      />
    </div>
  );
};
