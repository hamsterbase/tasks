import { z } from 'zod';
import OpenAI from 'openai';
import { ITodoService } from '@/services/todo/common/todoService';
import { TreeID } from 'loro-crdt';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { localize } from '@/nls';
import { toolMetaSchema } from '../toolMeta';
import { ToolConfig } from '../type';
import {
  createProjectWithChildrenParamsSchema,
  createTaskItemSchema,
  createHeadingItemSchema,
} from '@/core/state/tasks/createProject/types';
import { formatCreateProjectArguments, formatCreateProjectResult } from './formatters';

// AI Tool 专用的参数 schema，基于核心 schema 扩展
const createProjectToolParamsSchema = createProjectWithChildrenParamsSchema.extend({
  _meta: toolMetaSchema,
});

// 类型导出（保持兼容性）
export type CreateTaskParams = z.infer<typeof createTaskItemSchema>;
export type CreateHeadingParams = z.infer<typeof createHeadingItemSchema>;
export type CreateProjectToolParams = z.infer<typeof createProjectToolParamsSchema>;

export interface CreateProjectToolCall {
  id: string;
  name: 'createProject';
  arguments: CreateProjectToolParams;
}

export const CREATE_PROJECT_TOOL = {
  type: 'function',
  function: {
    name: 'createProject',
    description: 'Create a new project with tasks and headings',
    parameters: z.toJSONSchema(createProjectToolParamsSchema),
  },
} satisfies OpenAI.Chat.Completions.ChatCompletionTool;

export function executeCreateProject(
  instantiationService: IInstantiationService,
  params: CreateProjectToolParams
): TreeID {
  const todoService = instantiationService.invokeFunction((accessor) => {
    return accessor.get(ITodoService);
  });

  // 从 AI tool params 中提取核心函数需要的参数（排除 _meta）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _meta, ...coreParams } = params;

  // 通过 TodoService 调用核心函数
  return todoService.createProjectWithChildren(coreParams);
}

export const createProjectToolConfig: ToolConfig = {
  name: 'createProject',
  definition: CREATE_PROJECT_TOOL,
  type: 'confirm',
  displayName: localize('ai_chat.tool_createProject', 'Create Project'),
  formatArguments: formatCreateProjectArguments,
  execute: (instantiationService, args: CreateProjectToolParams) => {
    executeCreateProject(instantiationService, args);
    return {
      result: {
        success: true,
        resultSummary: 'Project created',
        formattedResult: formatCreateProjectResult(args.title),
      },
    };
  },
};
