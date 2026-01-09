import { z } from 'zod';
import OpenAI from 'openai';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { ITodoService } from '@/services/todo/common/todoService';
import { localize } from '@/nls';
import { toolMetaSchema } from '../toolMeta';
import { ToolConfig } from '../type';
import { BatchEditParamsSchema } from '@/core/state/tasks/batchEdit/types';
import { BatchEditResult } from '@/core/state/tasks/batchEdit/batchEdit';
import { formatBatchEditArguments, formatBatchEditResult } from './formatters';

// 扩展核心 schema，添加 _meta 字段
const batchEditToolParamsSchema = BatchEditParamsSchema.extend({
  _meta: toolMetaSchema,
});

export type BatchEditToolParams = z.infer<typeof batchEditToolParamsSchema>;

export interface BatchEditToolCall {
  id: string;
  name: 'batchEdit';
  arguments: BatchEditToolParams;
}

export const BATCH_EDIT_TOOL = {
  type: 'function',
  function: {
    name: 'batchEdit',
    description:
      'Perform batch operations on tasks, headings, projects, and areas. ' +
      'Supports adding, updating, and deleting items across multiple containers. ' +
      'Operations are grouped for user review before execution.',
    parameters: z.toJSONSchema(batchEditToolParamsSchema),
  },
} satisfies OpenAI.Chat.Completions.ChatCompletionTool;

/**
 * 执行 batchEdit 操作
 */
export function executeBatchEdit(
  instantiationService: IInstantiationService,
  params: BatchEditToolParams
): BatchEditResult {
  const todoService = instantiationService.invokeFunction((accessor) => {
    return accessor.get(ITodoService);
  });

  // 调用 TodoService 的 batchEdit 方法
  // 注意：传递给 batchEdit 的参数不包含 _meta
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _meta, ...batchEditParams } = params;
  return todoService.batchEdit(batchEditParams);
}

export const batchEditToolConfig: ToolConfig = {
  name: 'batchEdit',
  definition: BATCH_EDIT_TOOL,
  type: 'confirm',
  displayName: localize('ai_chat.tool_batchEdit', 'Batch Edit'),
  formatArguments: (args: BatchEditToolParams, instantiationService) => {
    let modelState;
    if (instantiationService) {
      try {
        const todoService = instantiationService.invokeFunction((accessor) => accessor.get(ITodoService));
        modelState = todoService.modelState;
      } catch {
        // ignore
      }
    }
    return formatBatchEditArguments(args, modelState);
  },
  execute: (instantiationService, args: BatchEditToolParams) => {
    const result = executeBatchEdit(instantiationService, args);
    return {
      result: {
        success: result.success,
        resultSummary: 'Batch edit completed',
        formattedResult: formatBatchEditResult(result),
      },
    };
  },
};
