import { ToolType } from './tools/tools';

/** Tool execution result */
export interface ToolExecutionResultInfo {
  success: boolean;
  resultSummary: string;
  formattedResult: string;
  /**
   * User-friendly formatted result for UI display.
   * If provided, this will be shown to users instead of formattedResult.
   * formattedResult is still sent to AI for reference.
   */
  formattedResultForUser?: string;
  /** If true, the result should not be displayed in the UI */
  hideResult?: boolean;
}

/** Tool call that requires user confirmation */
export interface ConfirmToolCallInfo {
  id: string;
  type: 'confirm';
  name: string;
  arguments: unknown;
  status: 'pending' | 'confirmed' | 'rejected';
  result?: ToolExecutionResultInfo;
}

/** Tool call that executes automatically */
export interface AutoToolCallInfo {
  id: string;
  type: 'auto';
  name: string;
  arguments: unknown;
  status: 'pending' | 'executed';
  result?: ToolExecutionResultInfo;
}

/** Tool call that is still being streamed */
export interface StreamingToolCallInfo {
  id: string;
  type: ToolType;
  name: string;
  argumentsJson: string;
  status: 'streaming';
}

export type UIToolCallInfo = ConfirmToolCallInfo | AutoToolCallInfo | StreamingToolCallInfo;

/** Text content block */
export interface TextContentBlock {
  type: 'text';
  text: string;
}

/** Thinking content block - shows AI reasoning process */
export interface ThinkingContentBlock {
  type: 'thinking';
  text: string;
  isStreaming?: boolean;
}

/** Tool call content block */
export interface ToolCallContentBlock {
  type: 'tool_call';
  toolCall: UIToolCallInfo;
}

export type ContentBlock = TextContentBlock | ThinkingContentBlock | ToolCallContentBlock;

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  contentBlocks: ContentBlock[];
  linkedMessageId?: string;
  timestamp: number;
  aborted?: boolean;
}

export interface ChatSession {
  messages: ChatMessageItem[];
  nextMessageId: number;
}
