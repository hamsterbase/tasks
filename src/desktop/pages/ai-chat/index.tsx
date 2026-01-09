import { ChatIcon, TrashIcon } from '@/components/icons';
import { DesktopPage } from '@/desktop/components/DesktopPage';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { localize } from '@/nls';
import React, { useCallback } from 'react';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { IAIService } from '@/services/ai/common/aiService';
import { useAutoScroll } from './useAutoScroll';

export const AIChat: React.FC = () => {
  const aiService = useService(IAIService);
  const controller = aiService.chatController;

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
    <DesktopPage
      header={
        <EntityHeader
          renderIcon={() => <ChatIcon />}
          title={localize('ai_chat', 'AI Chat')}
          extraActions={[
            {
              icon: <TrashIcon className="size-4" />,
              handleClick: handleClearChat,
              label: localize('ai_chat.clear', 'Clear'),
              title: localize('ai_chat.clear_chat', 'Clear chat'),
            },
          ]}
        />
      }
      showDetailPanel={false}
    >
      <div className="flex flex-col h-full">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
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
          onClearLink={handleClearLink}
          isConfigured={controller.isConfigured()}
          onStop={handleStop}
        />
      </div>
    </DesktopPage>
  );
};
