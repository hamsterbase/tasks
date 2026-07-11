import { createDecorator } from '@hamsterbase/foundation/instantiation';
import { Event } from '@hamsterbase/foundation/event';
import { ChatSession, ChatMessageItem } from '../browser/types';

export interface IAIChatController {
  readonly _serviceBrand: undefined;

  readonly onStateChange: Event<void>;

  readonly session: ChatSession;
  readonly isLoading: boolean;
  readonly linkedMessageId: string | undefined;
  readonly linkedMessage: ChatMessageItem | undefined;

  isConfigured(): boolean;

  sendMessage(content: string): Promise<void>;
  stopGeneration(): void;
  confirmToolCall(messageId: string, toolCallId: string): Promise<void>;
  rejectToolCall(messageId: string, toolCallId: string): void;
  linkMessage(messageId: string): void;
  clearLink(): void;
  clearChat(): void;
}

export const IAIChatController = createDecorator<IAIChatController>('aiChatController');
