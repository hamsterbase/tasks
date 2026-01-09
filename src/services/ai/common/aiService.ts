import { createDecorator } from 'vs/platform/instantiation/common/instantiation.ts';
import { UIToolCallInfo } from '../browser/types';
import { IAIChatController } from './chatController';

// Chat message types
export interface UserMessage {
  role: 'user';
  content: string;
}

export interface AssistantMessage {
  role: 'assistant';
  content: string;
  toolCalls?: UIToolCallInfo[];
}

export interface SystemMessage {
  role: 'system';
  content: string;
}

export interface ToolResultMessage {
  role: 'tool';
  toolCallId: string;
  content: string;
}

export type ChatMessage = UserMessage | AssistantMessage | SystemMessage | ToolResultMessage;

// Streaming tool call info (may have incomplete arguments)
export interface StreamingToolCallInfo {
  id: string;
  name: string;
  argumentsJson: string; // Raw JSON string being accumulated
  isComplete: boolean;
}

// Streaming response types
export type AIStreamEvent =
  | {
      type: 'thinking_start';
    }
  | {
      type: 'thinking_delta';
      content: string;
    }
  | {
      type: 'thinking_end';
    }
  | {
      type: 'content_start';
    }
  | {
      type: 'content_delta';
      content: string;
    }
  | {
      type: 'content_end';
    }
  | {
      type: 'tool_call_start';
      toolCall: StreamingToolCallInfo;
    }
  | {
      type: 'tool_call_delta';
      toolCall: StreamingToolCallInfo;
    }
  | {
      type: 'tool_calls';
      toolCalls: UIToolCallInfo[];
    }
  | {
      type: 'done';
      content: string;
      toolCalls?: UIToolCallInfo[];
    }
  | {
      type: 'error';
      error: string;
    };

export interface IAIService {
  readonly _serviceBrand: undefined;

  /**
   * Get the chat controller instance
   */
  readonly chatController: IAIChatController;

  /**
   * Send messages to AI and get streaming response
   */
  sendMessageStream(
    messages: ChatMessage[],
    onEvent: (event: AIStreamEvent) => void,
    signal?: AbortSignal
  ): Promise<void>;

  /**
   * Check if AI service is configured with API URL and token
   */
  isConfigured(): boolean;
}

export const IAIService = createDecorator<IAIService>('aiService');
