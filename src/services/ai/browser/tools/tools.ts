import OpenAI from 'openai';

import { requestReplyToolConfig } from './requestReply/requestReply';
import { createProjectToolConfig } from './createProject/createProject';
import { getDataToolConfig } from './getData/getData';
import { getProjectDataToolConfig } from './getProjectData/getProjectData';
import { runJavaScriptToolConfig } from './runJavaScript/runJavaScript';
import { batchEditToolConfig } from './batchEdit/batchEdit';

export { type ToolConfig, type ToolExecutionResult, type ToolType } from './type';

// Tool configurations
export const TOOL_CONFIGS = [
  createProjectToolConfig,
  runJavaScriptToolConfig,
  requestReplyToolConfig,
  getDataToolConfig,
  getProjectDataToolConfig,
  batchEditToolConfig,
] as const;

export function isValidToolName(name: string): boolean {
  return TOOL_CONFIGS.some((config) => config.name === name);
}

// Helper to get all tool definitions for OpenAI
export function getAllToolDefinitions(): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return TOOL_CONFIGS.map((config) => config.definition);
}

// Helper to get tool config by name
export function getToolConfig(name: string) {
  return TOOL_CONFIGS.find((config) => config.name === name);
}
