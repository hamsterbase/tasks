import { z } from 'zod';
import OpenAI from 'openai';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { ITodoService } from '@/services/todo/common/todoService';
import { localize } from '@/nls';
import { toolMetaSchema } from '../toolMeta';
import { ToolConfig } from '../type';
import { getProject } from '@/core/state/getProject';
import { ItemStatus } from '@/core/type';
import { formatGetProjectDataResult } from './formatters';

// Zod schema for getProjectData parameters
const getProjectDataParamsSchema = z.object({
  _meta: toolMetaSchema,
  projectId: z.string().describe('The ID of the project to get details for'),
});

export type GetProjectDataToolParams = z.infer<typeof getProjectDataParamsSchema>;

export interface GetProjectDataToolCall {
  id: string;
  name: 'getProjectData';
  arguments: GetProjectDataToolParams;
}

// Result types
export interface TaskItem {
  type: 'task';
  id: string;
  title: string;
  status: ItemStatus;
  startDate?: number;
  dueDate?: number;
  tags: string[];
  children?: TaskItem[];
}

export interface HeadingItem {
  type: 'heading';
  id: string;
  title: string;
  tasks: TaskItem[];
}

export interface ProjectDataResult {
  project: {
    id: string;
    title: string;
    notes?: string;
    status: ItemStatus;
    startDate?: number;
    dueDate?: number;
    tags: string[];
    items: (TaskItem | HeadingItem)[];
  };
}

export interface GetProjectDataError {
  error: string;
}

export type GetProjectDataResult = ProjectDataResult | GetProjectDataError;

export function executeGetProjectData(
  instantiationService: IInstantiationService,
  params: GetProjectDataToolParams
): GetProjectDataResult {
  const todoService = instantiationService.invokeFunction((accessor) => {
    return accessor.get(ITodoService);
  });

  const modelData = todoService.modelState;

  // Check if project exists
  const projectObj = modelData.taskObjectMap.get(params.projectId);
  if (!projectObj) {
    return { error: `Project not found: ${params.projectId}` };
  }
  if (projectObj.type !== 'project') {
    return { error: `Invalid project ID: ${params.projectId} (type: ${projectObj.type})` };
  }

  const projectInfo = getProject(modelData, params.projectId);

  // Convert tasks to TaskItem format
  const convertTask = (task: (typeof projectInfo.tasks)[0]): TaskItem => ({
    type: 'task',
    id: task.id,
    title: task.title,
    status: task.status,
    startDate: task.startDate,
    dueDate: task.dueDate,
    tags: task.tags,
    children:
      task.children && task.children.length > 0
        ? task.children.map((child) => ({
            type: 'task' as const,
            id: child.id,
            title: child.title,
            status: child.status,
            startDate: undefined,
            dueDate: undefined,
            tags: [],
          }))
        : undefined,
  });

  // Build items array with tasks and headings in order
  const items: (TaskItem | HeadingItem)[] = [];

  // Add root-level tasks
  for (const task of projectInfo.tasks) {
    items.push(convertTask(task));
  }

  // Add headings with their tasks
  for (const heading of projectInfo.projectHeadings) {
    items.push({
      type: 'heading',
      id: heading.id,
      title: heading.title,
      tasks: heading.tasks.map(convertTask),
    });
  }

  return {
    project: {
      id: projectInfo.id,
      title: projectInfo.title,
      notes: projectInfo.notes,
      status: projectInfo.status,
      startDate: projectInfo.startDate,
      dueDate: projectInfo.dueDate,
      tags: projectInfo.tags,
      items,
    },
  };
}

export const GET_PROJECT_DATA_TOOL = {
  type: 'function',
  function: {
    name: 'getProjectData',
    description:
      'Get detailed information about a specific project, including all tasks and headings. Use getData first to get the list of project IDs.',
    parameters: z.toJSONSchema(getProjectDataParamsSchema),
  },
} satisfies OpenAI.Chat.Completions.ChatCompletionTool;

function formatGetProjectDataArguments(args: GetProjectDataToolParams): string {
  return `Project ID: ${args.projectId}`;
}

export const getProjectDataToolConfig: ToolConfig = {
  name: 'getProjectData',
  definition: GET_PROJECT_DATA_TOOL,
  type: 'auto',
  displayName: localize('ai_chat.tool_getProjectData', 'Get Project Data'),
  formatArguments: formatGetProjectDataArguments,
  execute: async (instantiationService, args: GetProjectDataToolParams) => {
    const result = executeGetProjectData(instantiationService, args);
    const isError = 'error' in result;
    const formattedForAI = formatGetProjectDataResult(result, { forUser: false });
    const formattedForUser = formatGetProjectDataResult(result, { forUser: true });
    return {
      result: {
        success: !isError,
        resultSummary: isError ? 'Failed' : 'Data loaded',
        formattedResult: formattedForAI,
        formattedResultForUser: formattedForUser,
      },
    };
  },
};
