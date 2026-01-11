import OpenAI from 'openai';
import { aiApiTokenConfigKey, aiApiUrlConfigKey, aiModelNameConfigKey } from '@/services/config/config';
import { IConfigService } from '@/services/config/configService';
import { AIStreamEvent, ChatMessage, IAIService } from '../common/aiService';
import { getAllToolDefinitions, isValidToolName } from './tools/tools';
import SYSTEM_PROMPT from './systemPrompt.md?raw';
import { UIToolCallInfo as ToolCallInfo } from './types';
import { IAIChatController } from '../common/chatController';
import { AIChatController } from './chatSession/AIChatController';
import { IInstantiationService } from 'vscf/platform/instantiation/common';

export class WorkbenchAIService implements IAIService {
  readonly _serviceBrand: undefined;

  private _chatController: IAIChatController | undefined;

  constructor(
    @IConfigService private readonly configService: IConfigService,
    @IInstantiationService private readonly instantiationService: IInstantiationService
  ) {}

  get chatController(): IAIChatController {
    if (!this._chatController) {
      this._chatController = this.instantiationService.createInstance(AIChatController);
    }
    return this._chatController;
  }

  isConfigured(): boolean {
    const apiUrl = this.configService.get(aiApiUrlConfigKey());
    const apiToken = this.configService.get(aiApiTokenConfigKey());
    return !!apiUrl && !!apiToken;
  }

  private createOpenAIClientOptions(apiUrl: string, apiToken: string): ConstructorParameters<typeof OpenAI>[0] {
    const options: ConstructorParameters<typeof OpenAI>[0] = {
      baseURL: apiUrl,
      apiKey: apiToken,
      dangerouslyAllowBrowser: true,
    };

    if (apiUrl && apiUrl.includes('aihubmix.com')) {
      options.defaultHeaders = {
        'APP-Code': 'FKVW9753',
      };
    }

    return options;
  }

  private convertToOpenAIMessages(messages: ChatMessage[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const result: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{ role: 'system', content: SYSTEM_PROMPT }];

    for (const msg of messages) {
      if (msg.role === 'user') {
        result.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'system') {
        result.push({ role: 'system', content: msg.content });
      } else if (msg.role === 'assistant') {
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          const assistantMessage: OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam & {
            reasoning_content?: string;
          } = {
            role: 'assistant',
            content: msg.content || null,
            tool_calls: msg.toolCalls
              .filter((p) => p.status !== 'streaming')
              .map((tc) => ({
                id: tc.id,
                type: 'function' as const,
                function: {
                  name: tc.name,
                  arguments: JSON.stringify(tc.arguments),
                },
              })),
          };
          if (msg.reasoningContent) {
            assistantMessage.reasoning_content = msg.reasoningContent;
          }
          result.push(assistantMessage);
        } else {
          const assistantMessage: OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam & {
            reasoning_content?: string;
          } = { role: 'assistant', content: msg.content };
          if (msg.reasoningContent) {
            assistantMessage.reasoning_content = msg.reasoningContent;
          }
          result.push(assistantMessage);
        }
      } else if (msg.role === 'tool') {
        result.push({
          role: 'tool',
          tool_call_id: msg.toolCallId,
          content: msg.content,
        });
      }
    }

    return result;
  }

  async sendMessageStream(
    messages: ChatMessage[],
    onEvent: (event: AIStreamEvent) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const apiUrl = this.configService.get(aiApiUrlConfigKey());
    const apiToken = this.configService.get(aiApiTokenConfigKey());
    const modelName = this.configService.get(aiModelNameConfigKey());

    if (!apiToken) {
      onEvent({ type: 'error', error: 'AI API token is not configured' });
      return;
    }

    const client = new OpenAI(this.createOpenAIClientOptions(apiUrl, apiToken));

    const openaiMessages = this.convertToOpenAIMessages(messages);

    try {
      const stream = await client.chat.completions.create(
        {
          model: modelName,
          messages: openaiMessages,
          tools: getAllToolDefinitions(),
          stream: true,
        },
        { signal }
      );

      let contentStarted = false;
      let thinkingStarted = false;
      let accumulatedContent = '';
      let accumulatedReasoningContent = '';
      const toolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();

      for await (const chunk of stream) {
        if (signal?.aborted) {
          break;
        }

        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        // Handle thinking (reasoning) content - OpenAI uses 'reasoning_content' for o1 models
        // Some providers use 'reasoning' field
        const reasoning =
          (delta as unknown as { reasoning_content?: string; reasoning?: string }).reasoning_content ||
          (delta as unknown as { reasoning_content?: string; reasoning?: string }).reasoning;
        if (reasoning) {
          if (!thinkingStarted) {
            thinkingStarted = true;
            onEvent({ type: 'thinking_start' });
          }
          accumulatedReasoningContent += reasoning;
          onEvent({ type: 'thinking_delta', content: reasoning });
        }

        // Handle regular content
        if (delta.content) {
          if (thinkingStarted && !contentStarted) {
            onEvent({ type: 'thinking_end' });
          }
          if (!contentStarted) {
            contentStarted = true;
            onEvent({ type: 'content_start' });
          }
          accumulatedContent += delta.content;
          onEvent({ type: 'content_delta', content: delta.content });
        }

        // Handle tool calls
        if (delta.tool_calls) {
          for (const toolCall of delta.tool_calls) {
            const index = toolCall.index;
            const isNewToolCall = !toolCalls.has(index);

            if (isNewToolCall) {
              toolCalls.set(index, {
                id: toolCall.id || '',
                name: toolCall.function?.name || '',
                arguments: '',
              });
            }

            const existingCall = toolCalls.get(index)!;
            if (toolCall.id) {
              existingCall.id = toolCall.id;
            }
            if (toolCall.function?.name) {
              existingCall.name = toolCall.function.name;
            }
            if (toolCall.function?.arguments) {
              existingCall.arguments += toolCall.function.arguments;
            }

            // Emit tool call events
            if (isValidToolName(existingCall.name)) {
              const streamingInfo = {
                id: existingCall.id,
                name: existingCall.name,
                argumentsJson: existingCall.arguments,
                isComplete: false,
              };

              if (isNewToolCall && existingCall.name) {
                onEvent({ type: 'tool_call_start', toolCall: streamingInfo });
              } else if (toolCall.function?.arguments) {
                onEvent({ type: 'tool_call_delta', toolCall: streamingInfo });
              }
            }
          }
        }
      }

      // End content stream if started
      if (contentStarted) {
        onEvent({ type: 'content_end' });
      } else if (thinkingStarted) {
        onEvent({ type: 'thinking_end' });
      }

      // Process tool calls
      const parsedToolCalls: ToolCallInfo[] = [];
      for (const [, toolCall] of toolCalls) {
        if (isValidToolName(toolCall.name)) {
          try {
            parsedToolCalls.push({
              id: toolCall.id,
              name: toolCall.name,
              arguments: JSON.parse(toolCall.arguments),
            } as ToolCallInfo);
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Send tool calls event if any
      if (parsedToolCalls.length > 0) {
        onEvent({ type: 'tool_calls', toolCalls: parsedToolCalls });
      }

      // Send done event
      onEvent({
        type: 'done',
        content: accumulatedContent,
        toolCalls: parsedToolCalls.length > 0 ? parsedToolCalls : undefined,
        reasoningContent: accumulatedReasoningContent || undefined,
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }
      onEvent({ type: 'error', error: (error as Error).message });
    }
  }
}
