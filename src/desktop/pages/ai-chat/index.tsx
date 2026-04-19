import { AIIcon, RotateCcwIcon } from '@/components/icons';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IAIService } from '@/services/ai/common/aiService';
import { desktopStyles } from '@/desktop/theme/main';
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
    <div className={desktopStyles.AIChatPageRoot}>
      <div className={desktopStyles.AIChatPageHeader}>
        <div className={desktopStyles.AIChatPageHeaderMain}>
          <div className={desktopStyles.AIChatPageHeaderIconContainer}>
            <button className={desktopStyles.AIChatPageHeaderIconButton}>
              <AIIcon className={desktopStyles.AIChatPageHeaderIcon} strokeWidth={1.5} />
            </button>
          </div>
          <div className={desktopStyles.AIChatPageHeaderTitleGroup}>
            <h1 className={desktopStyles.AIChatPageHeaderTitle}>{localize('ai_chat', 'AI Chat')}</h1>
          </div>
        </div>
        <div className={desktopStyles.AIChatPageHeaderActions}>
          <button onClick={handleClearChat} className={desktopStyles.AIChatPageHeaderActionButton}>
            <span className={desktopStyles.AIChatPageHeaderActionIconContainer}>
              <RotateCcwIcon className={desktopStyles.AIChatPageHeaderActionIcon} strokeWidth={1.5} />
            </span>
            <span className={desktopStyles.AIChatPageHeaderActionLabel}>
              {localize('ai_chat.new_chat', 'New Chat')}
            </span>
          </button>
        </div>
      </div>
      <div ref={scrollContainerRef} className={desktopStyles.AIChatPageScrollContainer}>
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
