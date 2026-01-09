import { Emitter } from 'vscf/base/common/event';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IAIService, ChatMessage, AIStreamEvent } from '../../common/aiService';
import { isValidToolName, getToolConfig, ToolExecutionResult } from '../tools/tools';
import {
  ChatSession,
  ChatMessageItem,
  ContentBlock,
  UIToolCallInfo,
  ToolCallContentBlock,
  StreamingToolCallInfo,
  ToolExecutionResultInfo,
  UIToolCallInfo as ToolCallInfo,
} from '../types';
import { IAIChatController } from '../../common/chatController';

const SESSION_STORAGE_KEY = 'ai_chat_session';

function loadChatSession(): ChatSession {
  try {
    const data = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        messages: parsed.messages ?? [],
        nextMessageId: parsed.nextMessageId ?? 1,
      };
    }
  } catch (e) {
    console.error('Failed to load chat session:', e);
  }
  return { messages: [], nextMessageId: 1 };
}

function saveChatSession(session: ChatSession): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save chat session:', e);
  }
}

export class AIChatController implements IAIChatController {
  readonly _serviceBrand: undefined;

  private _onStateChange = new Emitter<void>();
  readonly onStateChange = this._onStateChange.event;

  private _session: ChatSession;
  private _isLoading = false;
  private _linkedMessageId: string | undefined = undefined;
  private _abortController: AbortController | null = null;

  constructor(
    @IAIService private readonly aiService: IAIService,
    @IInstantiationService private readonly instantiationService: IInstantiationService
  ) {
    this._session = loadChatSession();
  }

  get session(): ChatSession {
    return this._session;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get linkedMessageId(): string | undefined {
    return this._linkedMessageId;
  }

  get linkedMessage(): ChatMessageItem | undefined {
    if (!this._linkedMessageId) return undefined;
    return this._session.messages.find((m) => m.id === this._linkedMessageId);
  }

  isConfigured(): boolean {
    return this.aiService.isConfigured();
  }

  linkMessage(messageId: string): void {
    this._linkedMessageId = messageId;
    this._onStateChange.fire();
  }

  clearLink(): void {
    this._linkedMessageId = undefined;
    this._onStateChange.fire();
  }

  clearChat(): void {
    this._session = { messages: [], nextMessageId: 1 };
    this._saveSession();
    this._onStateChange.fire();
  }

  stopGeneration(): void {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;

      // Mark the last assistant message as aborted
      const lastMessage = this._session.messages[this._session.messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        this._session = {
          ...this._session,
          messages: this._session.messages.map((m, index) =>
            index === this._session.messages.length - 1 ? { ...m, aborted: true } : m
          ),
        };
        this._saveSession();
        this._onStateChange.fire();
      }
    }
  }

  async confirmToolCall(messageId: string, toolCallId: string): Promise<void> {
    const message = this._session.messages.find((m) => m.id === messageId);
    if (!message) return;

    const toolCall = this._findToolCallInMessage(message, toolCallId);
    if (!toolCall || toolCall.status !== 'pending') return;

    const config = getToolConfig(toolCall.name);
    if (!config || config.type !== 'confirm') return;

    // Execute the tool and get result
    const execResult = await config.execute(this.instantiationService, toolCall.arguments);

    // Update message status with result
    this._updateToolCallStatus(messageId, toolCallId, 'confirmed', execResult?.result);
  }

  rejectToolCall(messageId: string, toolCallId: string): void {
    this._updateToolCallStatus(messageId, toolCallId, 'rejected');
  }

  async sendMessage(content: string): Promise<void> {
    if (!content.trim() || this._isLoading) return;

    this._abortController = new AbortController();
    const userMessageId = String(this._session.nextMessageId);
    const assistantMessageId = String(this._session.nextMessageId + 1);

    const userMessage: ChatMessageItem = {
      id: userMessageId,
      role: 'user',
      contentBlocks: [{ type: 'text', text: content.trim() }],
      linkedMessageId: this._linkedMessageId,
      timestamp: Date.now(),
    };

    this._session = {
      ...this._session,
      messages: [...this._session.messages, userMessage],
      nextMessageId: this._session.nextMessageId + 2,
    };
    this._linkedMessageId = undefined;
    this._isLoading = true;
    this._saveSession();
    this._onStateChange.fire();
    const contentBlocks: ContentBlock[] = [];
    let currentThinkingText = '';
    let currentContentText = '';
    let shouldLinkResponseToAssistant = false;

    try {
      const context = this._buildContext(userMessage.linkedMessageId);
      let messages: ChatMessage[] = [...context, { role: 'user', content: content.trim() }];

      const processStream = async (): Promise<{ toolCalls?: ToolCallInfo[]; content: string }> => {
        return new Promise((resolve, reject) => {
          let finalContent = '';
          let finalToolCalls: ToolCallInfo[] | undefined;

          const handleEvent = (event: AIStreamEvent) => {
            switch (event.type) {
              case 'thinking_start':
                currentThinkingText = '';
                contentBlocks.push({ type: 'thinking', text: '', isStreaming: true });
                this._updateAssistantMessage(assistantMessageId, contentBlocks);
                break;

              case 'thinking_delta': {
                currentThinkingText += event.content;
                const thinkingBlockIndex = contentBlocks.findIndex((b) => b.type === 'thinking' && b.isStreaming);
                if (thinkingBlockIndex >= 0) {
                  contentBlocks[thinkingBlockIndex] = {
                    type: 'thinking',
                    text: currentThinkingText,
                    isStreaming: true,
                  };
                  this._updateAssistantMessage(assistantMessageId, contentBlocks);
                }
                break;
              }

              case 'thinking_end': {
                const thinkingEndIndex = contentBlocks.findIndex((b) => b.type === 'thinking' && b.isStreaming);
                if (thinkingEndIndex >= 0) {
                  contentBlocks[thinkingEndIndex] = {
                    type: 'thinking',
                    text: currentThinkingText,
                    isStreaming: false,
                  };
                  this._updateAssistantMessage(assistantMessageId, contentBlocks);
                }
                break;
              }

              case 'content_start':
                currentContentText = '';
                contentBlocks.push({ type: 'text', text: '' });
                this._updateAssistantMessage(assistantMessageId, contentBlocks);
                break;

              case 'content_delta': {
                currentContentText += event.content;
                const textBlockIndex = contentBlocks.length - 1;
                if (textBlockIndex >= 0 && contentBlocks[textBlockIndex].type === 'text') {
                  contentBlocks[textBlockIndex] = {
                    type: 'text',
                    text: currentContentText,
                  };
                  this._updateAssistantMessage(assistantMessageId, contentBlocks);
                }
                break;
              }

              case 'content_end':
                break;

              case 'tool_call_start': {
                const toolConfig = getToolConfig(event.toolCall.name);
                contentBlocks.push({
                  type: 'tool_call',
                  toolCall: {
                    id: event.toolCall.id,
                    type: toolConfig?.type ?? 'auto',
                    name: event.toolCall.name,
                    argumentsJson: event.toolCall.argumentsJson,
                    status: 'streaming',
                  },
                });
                this._updateAssistantMessage(assistantMessageId, contentBlocks);
                break;
              }

              case 'tool_call_delta': {
                const toolCallIndex = contentBlocks.findIndex(
                  (b) =>
                    b.type === 'tool_call' && b.toolCall.status === 'streaming' && b.toolCall.id === event.toolCall.id
                );
                if (toolCallIndex >= 0) {
                  const existingToolCall = contentBlocks[toolCallIndex] as ToolCallContentBlock;
                  contentBlocks[toolCallIndex] = {
                    type: 'tool_call',
                    toolCall: {
                      ...existingToolCall.toolCall,
                      argumentsJson: event.toolCall.argumentsJson,
                    } as StreamingToolCallInfo,
                  };
                  this._updateAssistantMessage(assistantMessageId, contentBlocks);
                }
                break;
              }

              case 'tool_calls':
                finalToolCalls = event.toolCalls;
                break;

              case 'done':
                finalContent = event.content;
                if (event.toolCalls) {
                  finalToolCalls = event.toolCalls;
                }
                resolve({ toolCalls: finalToolCalls, content: finalContent });
                break;

              case 'error':
                reject(new Error(event.error));
                break;
            }
          };

          this.aiService.sendMessageStream(messages, handleEvent, this._abortController?.signal).catch(reject);
        });
      };

      const MAX_TOOL_CALL_ITERATIONS = 10;
      let iterationCount = 0;
      let continueLoop = true;
      while (continueLoop && iterationCount < MAX_TOOL_CALL_ITERATIONS) {
        iterationCount++;
        const result = await processStream();

        if (result.toolCalls && result.toolCalls.length > 0) {
          const { executionResults, shouldLinkResponse, toolCallBlocks } = await this._executeToolCalls(
            result.toolCalls
          );
          if (shouldLinkResponse) {
            shouldLinkResponseToAssistant = true;
          }

          for (const toolCallBlock of toolCallBlocks) {
            if (toolCallBlock.type !== 'tool_call') continue;
            const streamingIndex = contentBlocks.findIndex(
              (b) =>
                b.type === 'tool_call' &&
                b.toolCall.status === 'streaming' &&
                b.toolCall.id === toolCallBlock.toolCall.id
            );
            if (streamingIndex >= 0) {
              contentBlocks[streamingIndex] = toolCallBlock;
            } else {
              contentBlocks.push(toolCallBlock);
            }
          }
          this._updateAssistantMessage(assistantMessageId, contentBlocks);

          if (executionResults.size > 0) {
            const toolCallsForMessage: ToolCallInfo[] = result.toolCalls;

            messages = [
              ...messages,
              {
                role: 'assistant' as const,
                content: result.content || '',
                toolCalls: toolCallsForMessage,
              },
            ];

            for (const toolCall of result.toolCalls) {
              const execResult = executionResults.get(toolCall.id);
              if (execResult?.result?.formattedResult) {
                messages.push({
                  role: 'tool' as const,
                  toolCallId: toolCall.id,
                  content: execResult.result.formattedResult,
                });
              }
            }

            currentThinkingText = '';
            currentContentText = '';
          } else {
            continueLoop = false;
          }
        } else {
          continueLoop = false;
        }
      }
    } catch (error) {
      contentBlocks.push({ type: 'text', text: `Error: ${(error as Error).message}` });
      this._updateAssistantMessage(assistantMessageId, contentBlocks);
    } finally {
      this._isLoading = false;
      this._abortController = null;
      // Auto-link to assistant response if any tool requested it
      if (shouldLinkResponseToAssistant) {
        this._linkedMessageId = assistantMessageId;
      }
      this._onStateChange.fire();
    }
  }

  private _saveSession(): void {
    saveChatSession(this._session);
  }

  private _getMessageText(message: ChatMessageItem): string {
    return message.contentBlocks
      .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
      .map((block) => block.text)
      .join('\n');
  }

  private _buildMessagesFromItem(message: ChatMessageItem): ChatMessage[] {
    const result: ChatMessage[] = [];

    if (message.role === 'user') {
      result.push({ role: 'user', content: this._getMessageText(message) });
    } else if (message.role === 'assistant') {
      const toolCallBlocks = message.contentBlocks.filter(
        (block): block is { type: 'tool_call'; toolCall: UIToolCallInfo } => block.type === 'tool_call'
      );

      // Only include tool calls that are not streaming
      const nonStreamingToolCallBlocks = toolCallBlocks.filter((block) => block.toolCall.status !== 'streaming');

      const toolCalls: ToolCallInfo[] = [];
      for (const block of nonStreamingToolCallBlocks) {
        const tc = block.toolCall;
        if (tc.status === 'streaming') continue; // TypeScript guard
        if (isValidToolName(tc.name)) {
          toolCalls.push({ id: tc.id, name: tc.name, arguments: tc.arguments } as ToolCallInfo);
        }
      }

      result.push({
        role: 'assistant',
        content: this._getMessageText(message),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      });

      // Add tool result messages for all non-streaming tool calls
      for (const block of nonStreamingToolCallBlocks) {
        const tc = block.toolCall;
        let toolResultContent: string;

        if (tc.status === 'executed' && tc.result) {
          toolResultContent = JSON.stringify(tc.result);
        } else if (tc.status === 'confirmed') {
          toolResultContent = JSON.stringify({ success: true, message: 'Tool executed successfully' });
        } else if (tc.status === 'rejected') {
          toolResultContent = JSON.stringify({ success: false, message: 'Tool execution was rejected by user' });
        } else if (tc.status === 'pending') {
          toolResultContent = JSON.stringify({
            success: false,
            message: 'Tool execution is pending user confirmation',
          });
        } else {
          continue;
        }

        result.push({
          role: 'tool',
          toolCallId: tc.id,
          content: toolResultContent,
        });
      }
    }

    return result;
  }

  private _buildContext(linkedId?: string): ChatMessage[] {
    if (!linkedId) {
      return [];
    }

    // Collect messages by recursively following linkedMessageId
    const messageChain: ChatMessageItem[] = [];
    let currentId: string | undefined = linkedId;

    while (currentId) {
      const message = this._session.messages.find((m) => m.id === currentId);
      if (!message) break;

      messageChain.unshift(message);

      // Find the previous message (question before this answer)
      const messageIndex = this._session.messages.findIndex((m) => m.id === currentId);
      if (messageIndex > 0) {
        const prevMessage = this._session.messages[messageIndex - 1];
        // If current is assistant and prev is user, include the user message
        if (message.role === 'assistant' && prevMessage.role === 'user') {
          messageChain.unshift(prevMessage);
          // Continue tracing from the user message's linkedMessageId
          currentId = prevMessage.linkedMessageId;
        } else {
          currentId = message.linkedMessageId;
        }
      } else {
        break;
      }
    }

    // Build ChatMessage array from the chain
    const result: ChatMessage[] = [];
    for (const msg of messageChain) {
      result.push(...this._buildMessagesFromItem(msg));
    }

    return result;
  }

  private async _executeToolCalls(toolCalls: ToolCallInfo[]): Promise<{
    executionResults: Map<string, ToolExecutionResult>;
    shouldLinkResponse: boolean;
    toolCallBlocks: ContentBlock[];
  }> {
    const executionResults = new Map<string, ToolExecutionResult>();
    const toolCallBlocks: ContentBlock[] = [];
    let shouldLinkResponse = false;

    for (const toolCall of toolCalls) {
      const toolName = toolCall.name;
      if (!isValidToolName(toolName)) continue;

      const config = getToolConfig(toolName);
      if (!config) continue;

      if (toolCall.status === 'streaming') {
        continue;
      }
      if (config.type === 'confirm') {
        // Confirmable tool - wait for user confirmation
        toolCallBlocks.push({
          type: 'tool_call',
          toolCall: {
            id: toolCall.id,
            type: 'confirm',
            name: toolName,
            arguments: toolCall.arguments,
            status: 'pending',
          },
        });
      } else {
        // Auto-execute tool
        const execResult = await config.execute(this.instantiationService, toolCall.arguments);
        if (execResult) {
          executionResults.set(toolCall.id, execResult);
          if (execResult.shouldLinkResponse) {
            shouldLinkResponse = true;
          }
        }
        toolCallBlocks.push({
          type: 'tool_call',
          toolCall: {
            id: toolCall.id,
            type: 'auto',
            name: toolName,
            arguments: toolCall.arguments,
            status: 'executed',
            result: execResult?.result,
          },
        });
      }
    }

    return { executionResults, shouldLinkResponse, toolCallBlocks };
  }

  private _updateAssistantMessage(assistantMessageId: string, contentBlocks: ContentBlock[]): void {
    const existingIndex = this._session.messages.findIndex((m) => m.id === assistantMessageId);
    if (existingIndex >= 0) {
      const newMessages = [...this._session.messages];
      newMessages[existingIndex] = {
        ...newMessages[existingIndex],
        contentBlocks: [...contentBlocks],
      };
      this._session = { ...this._session, messages: newMessages };
    } else {
      this._session = {
        ...this._session,
        messages: [
          ...this._session.messages,
          {
            id: assistantMessageId,
            role: 'assistant',
            contentBlocks: [...contentBlocks],
            timestamp: Date.now(),
          },
        ],
      };
    }
    this._saveSession();
    this._onStateChange.fire();
  }

  private _findToolCallInMessage(message: ChatMessageItem, toolCallId: string): UIToolCallInfo | undefined {
    for (const block of message.contentBlocks) {
      if (block.type === 'tool_call' && block.toolCall.id === toolCallId) {
        return block.toolCall;
      }
    }
    return undefined;
  }

  private _updateToolCallStatus(
    messageId: string,
    toolCallId: string,
    status: 'confirmed' | 'rejected',
    result?: ToolExecutionResultInfo
  ): void {
    this._session = {
      ...this._session,
      messages: this._session.messages.map((m): ChatMessageItem => {
        if (m.id !== messageId) return m;
        return {
          ...m,
          contentBlocks: m.contentBlocks.map((block): ContentBlock => {
            if (block.type !== 'tool_call' || block.toolCall.id !== toolCallId) return block;
            if (block.toolCall.status === 'streaming') return block;

            const config = getToolConfig(block.toolCall.name);
            if (!config || config.type !== 'confirm') return block;

            return {
              ...block,
              toolCall: { ...block.toolCall, status, result } as UIToolCallInfo,
            };
          }),
        };
      }),
    };
    this._saveSession();
    this._onStateChange.fire();
  }
}
