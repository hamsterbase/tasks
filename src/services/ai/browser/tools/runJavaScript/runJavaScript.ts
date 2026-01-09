import { z } from 'zod';
import OpenAI from 'openai';
import { localize } from '@/nls';
import { toolMetaSchema } from '../toolMeta';
import { ToolConfig } from '../type';

export interface SandboxResult {
  success: boolean;
  output: string[];
  error?: string;
}

// Zod schema for runJavaScript parameters
const runJavaScriptParamsSchema = z.object({
  _meta: toolMetaSchema,
  code: z.string().describe('The JavaScript code to execute'),
});

export type RunJavaScriptToolParams = z.infer<typeof runJavaScriptParamsSchema>;

export interface RunJavaScriptToolCall {
  id: string;
  name: 'runJavaScript';
  arguments: RunJavaScriptToolParams;
}

function createWorkerFromCode(workerCode: string): { worker: Worker; blobUrl: string } {
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const blobUrl = URL.createObjectURL(blob);
  return { worker: new Worker(blobUrl), blobUrl };
}

function executeInSandbox(code: string, timeout = 5000): Promise<SandboxResult> {
  const workerCode = `
      self.onmessage = function(e) {
        const output = [];
        const console = {
          log: (...args) => output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          warn: (...args) => output.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args) => output.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
        };

        const executionTimeout = setTimeout(() => {
          self.postMessage({ success: false, error: 'Execution timeout', output });
          self.close();
        }, ${timeout});

        try {
          const func = new Function('console', 'Math', 'JSON', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'RegExp', \`
            "use strict";
            \${e.data}
          \`);

          func(console, Math, JSON, Date, Array, Object, String, Number, Boolean, RegExp);

          clearTimeout(executionTimeout);
          self.postMessage({ success: true, output });
        } catch (error) {
          clearTimeout(executionTimeout);
          self.postMessage({ success: false, error: error.message, output });
        }
      };
    `;

  return new Promise((resolve) => {
    const { worker, blobUrl } = createWorkerFromCode(workerCode);

    const masterTimeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      resolve({ success: false, error: 'Master thread timeout', output: [] });
    }, timeout + 1000);

    worker.onmessage = (e: MessageEvent<SandboxResult>) => {
      clearTimeout(masterTimeout);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      resolve(e.data);
    };

    worker.onerror = (error) => {
      clearTimeout(masterTimeout);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      resolve({ success: false, error: error.message, output: [] });
    };

    worker.postMessage(code);
  });
}

export async function executeRunJavaScript(params: RunJavaScriptToolParams): Promise<SandboxResult> {
  return executeInSandbox(params.code);
}

export function formatRunJavaScriptResult(result: SandboxResult): string {
  if (result.success) {
    return `Output:\n${result.output.join('\n')}`;
  }
  return `Error: ${result.error}\nOutput:\n${result.output.join('\n')}`;
}

export const RUN_JAVASCRIPT_TOOL = {
  type: 'function',
  function: {
    name: 'runJavaScript',
    description:
      'Execute JavaScript code in a sandboxed environment. Use console.log() to output results. Available globals: Math, JSON, Date, Array, Object, String, Number, Boolean, RegExp.',
    parameters: z.toJSONSchema(runJavaScriptParamsSchema),
  },
} satisfies OpenAI.Chat.Completions.ChatCompletionTool;

function formatRunJavaScriptArguments(args: RunJavaScriptToolParams): string {
  return args.code;
}

export const runJavaScriptToolConfig: ToolConfig = {
  name: 'runJavaScript',
  definition: RUN_JAVASCRIPT_TOOL,
  type: 'auto',
  displayName: localize('ai_chat.tool_runJavaScript', 'Run JavaScript'),
  formatArguments: formatRunJavaScriptArguments,
  execute: async (_instantiationService, args: RunJavaScriptToolParams) => {
    const sandboxResult = await executeRunJavaScript(args);
    return {
      result: {
        success: sandboxResult.success,
        resultSummary: sandboxResult.success ? 'Executed' : 'Failed',
        formattedResult: formatRunJavaScriptResult(sandboxResult),
      },
    };
  },
};
