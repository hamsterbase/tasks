import { z } from 'zod';
import OpenAI from 'openai';
import { localize } from '@/nls';
import { toolMetaSchema } from '../toolMeta';
import { ToolConfig } from '../type';

// Zod schema for requestReply parameters
const requestReplyParamsSchema = z.object({
  _meta: toolMetaSchema,
});

export type RequestReplyToolParams = z.infer<typeof requestReplyParamsSchema>;

export interface RequestReplyToolCall {
  id: string;
  name: 'requestReply';
  arguments: RequestReplyToolParams;
}

export const REQUEST_REPLY_TOOL = {
  type: 'function',
  function: {
    name: 'requestReply',
    description:
      'Use this tool when you need more information from the user to complete the task. The conversation will be automatically linked for follow-up, allowing the user to reply directly to this message.',
    parameters: z.toJSONSchema(requestReplyParamsSchema),
  },
} satisfies OpenAI.Chat.Completions.ChatCompletionTool;

function formatRequestReplyArguments(): string {
  return 'Waiting for user reply';
}

export const requestReplyToolConfig: ToolConfig = {
  name: 'requestReply',
  definition: REQUEST_REPLY_TOOL,
  type: 'auto',
  displayName: localize('ai_chat.tool_requestReply', 'Request Reply'),
  formatArguments: formatRequestReplyArguments,
  execute: async () => {
    return {
      result: {
        success: true,
        resultSummary: 'Waiting for response',
        formattedResult: JSON.stringify({
          success: true,
          message: 'Request sent to user. Waiting for user response.',
        }),
        hideResult: true,
      },
      shouldLinkResponse: true,
    };
  },
};
