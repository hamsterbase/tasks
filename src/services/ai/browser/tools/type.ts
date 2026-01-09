import OpenAI from 'openai';
import { IInstantiationService } from 'vscf/platform/instantiation/common';

import { ToolExecutionResultInfo } from '../types';

// Tool execution result
export interface ToolExecutionResult {
  result?: ToolExecutionResultInfo;
  /** If true, the response will be automatically linked for follow-up */
  shouldLinkResponse?: boolean;
}

// Tool types
export type ToolType = 'confirm' | 'auto';

// Tool configuration
export interface ToolConfig {
  name: string;
  definition: OpenAI.Chat.Completions.ChatCompletionTool;
  type: ToolType;
  displayName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatArguments: (args: any, instantiationService?: IInstantiationService) => string;
  execute: (
    instantiationService: IInstantiationService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any
  ) => ToolExecutionResult | Promise<ToolExecutionResult> | void;
}
