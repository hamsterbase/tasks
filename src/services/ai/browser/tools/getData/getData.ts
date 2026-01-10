import { z } from 'zod';
import OpenAI from 'openai';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { ITodoService } from '@/services/todo/common/todoService';
import { localize } from '@/nls';
import { toolMetaSchema } from '../toolMeta';
import { ToolConfig } from '../type';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { getProject } from '@/core/state/getProject';
import { getArea } from '@/core/state/getAreaState';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { ITaskModelData } from '@/core/state/type';
import { TreeID } from 'loro-crdt';
import { formatGetDataResult } from './formatters';

// Zod schema for getData parameters
const getDataParamsSchema = z.object({
  _meta: toolMetaSchema,
  includeCompleted: z.boolean().default(true).describe('Whether to include completed tasks and projects'),
});

export type GetDataToolParams = z.infer<typeof getDataParamsSchema>;

export interface GetDataToolCall {
  id: string;
  name: 'getData';
  arguments: GetDataToolParams;
}

// Result types
export interface InboxTaskItem {
  id: string;
  title: string;
  startDate?: number;
  dueDate?: number;
  tags: string[];
}

export interface ProjectOverviewItem {
  id: string;
  title: string;
  status: 'created' | 'completed' | 'canceled';
  taskCount: number;
  completedCount: number;
  startDate?: number;
  dueDate?: number;
  tags: string[];
}

export interface AreaOverviewItem {
  id: string;
  title: string;
  projectCount: number;
  tags: string[];
}

export interface UpcomingItem {
  id: string;
  title: string;
  projectId?: string;
  projectTitle?: string;
  startDate?: number;
  dueDate?: number;
}

export interface GetDataResult {
  today: number;
  inbox: InboxTaskItem[];
  projects: ProjectOverviewItem[];
  areas: AreaOverviewItem[];
  upcoming: UpcomingItem[];
}

function getAllProjects(modelData: ITaskModelData): ProjectOverviewItem[] {
  const projects: ProjectOverviewItem[] = [];

  // Get root level projects
  for (const id of modelData.rootObjectIdList) {
    const obj = modelData.taskObjectMap.get(id);
    if (obj?.type === 'project') {
      const projectInfo = getProject(modelData, id);
      projects.push({
        id: projectInfo.id,
        title: projectInfo.title,
        status: projectInfo.status,
        taskCount: projectInfo.totalTasks,
        completedCount: projectInfo.completedTasks,
        startDate: projectInfo.startDate,
        dueDate: projectInfo.dueDate,
        tags: projectInfo.tags,
      });
    }
  }

  // Get projects inside areas
  for (const id of modelData.rootObjectIdList) {
    const obj = modelData.taskObjectMap.get(id);
    if (obj?.type === 'area') {
      const areaInfo = getArea(modelData, id as TreeID);
      if (areaInfo) {
        for (const project of areaInfo.projectList) {
          projects.push({
            id: project.id,
            title: project.title,
            status: project.status,
            taskCount: project.totalTasks,
            completedCount: project.completedTasks,
            startDate: project.startDate,
            dueDate: project.dueDate,
            tags: project.tags,
          });
        }
      }
    }
  }

  return projects;
}

function getAllAreas(modelData: ITaskModelData): AreaOverviewItem[] {
  const areas: AreaOverviewItem[] = [];

  for (const id of modelData.rootObjectIdList) {
    const obj = modelData.taskObjectMap.get(id);
    if (obj?.type === 'area') {
      const areaInfo = getArea(modelData, id as TreeID);
      if (areaInfo) {
        areas.push({
          id: areaInfo.id,
          title: areaInfo.title,
          projectCount: areaInfo.projectList.length,
          tags: areaInfo.tags,
        });
      }
    }
  }

  return areas;
}

export function executeGetData(instantiationService: IInstantiationService, params: GetDataToolParams): GetDataResult {
  const todoService = instantiationService.invokeFunction((accessor) => {
    return accessor.get(ITodoService);
  });

  const modelData = todoService.modelState;
  const today = Date.now();
  const includeCompleted = params.includeCompleted ?? false;

  // Get inbox tasks
  const inboxResult = getInboxTasks(modelData, {
    currentDate: today,
    showCompletedTasksAfter: 0,
    showFutureTasks: true,
    keepAliveElements: [],
    showCompletedTasks: includeCompleted,
  });

  const inbox: InboxTaskItem[] = inboxResult.inboxTasks
    .filter((task) => includeCompleted || task.status === 'created')
    .map((task) => ({
      id: task.id,
      title: task.title,
      startDate: task.startDate,
      dueDate: task.dueDate,
      tags: task.tags,
    }));

  // Get all projects
  const allProjects = getAllProjects(modelData);
  const projects = includeCompleted ? allProjects : allProjects.filter((p) => p.status === 'created');

  // Get all areas
  const areas = getAllAreas(modelData);

  // Get upcoming items (today and near future)
  const todayResult = getTodayItems(modelData, today, {
    currentDate: today,
    showFutureTasks: false,
    showCompletedTasks: false,
    completedAfter: 0,
    recentChangedTaskSet: new Set(),
  });

  const upcoming: UpcomingItem[] = todayResult.items
    .filter((item) => item.status === 'created')
    .map((item) => {
      if (item.type === 'task') {
        return {
          id: item.id,
          title: item.title,
          projectId: item.parentId,
          projectTitle: item.projectTitle || undefined,
          startDate: item.startDate,
          dueDate: item.dueDate,
        };
      } else {
        // project
        return {
          id: item.id,
          title: item.title,
          startDate: item.startDate,
          dueDate: item.dueDate,
        };
      }
    });

  return {
    today,
    inbox,
    projects,
    areas,
    upcoming,
  };
}

export const GET_DATA_TOOL = {
  type: 'function',
  function: {
    name: 'getData',
    description:
      "Get a global overview of the user's tasks, projects, and areas. Returns inbox tasks, project summaries, area summaries, and upcoming items.",
    parameters: z.toJSONSchema(getDataParamsSchema),
  },
} satisfies OpenAI.Chat.Completions.ChatCompletionTool;

function formatGetDataArguments(params: GetDataToolParams): string {
  return 'Fetching task data overview. Include completed items: ' + (params.includeCompleted ? 'Yes' : 'No') + '.';
}

export const getDataToolConfig: ToolConfig = {
  name: 'getData',
  definition: GET_DATA_TOOL,
  type: 'auto',
  displayName: localize('ai_chat.tool_getData', 'Get Data'),
  formatArguments: formatGetDataArguments,
  execute: async (instantiationService, args: GetDataToolParams) => {
    const result = executeGetData(instantiationService, args);
    const formattedForAI = formatGetDataResult(result, { forUser: false });
    const formattedForUser = formatGetDataResult(result, { forUser: true });
    return {
      result: {
        success: true,
        resultSummary: 'Data loaded',
        formattedResult: formattedForAI,
        formattedResultForUser: formattedForUser,
      },
    };
  },
};
