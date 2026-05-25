import type { ItemSchema } from './ruleFactory.ts';
import type { TaskSchema } from '../type.ts';

export type TaskRuleParent = 'inbox' | 'project' | 'area' | 'heading' | 'task';

export type TaskRuleItem = {
  title: string;
  notes: string;
  status: 'created' | 'completed' | 'canceled';
  tags: string[];
  startDate: number | null;
  dueDate: number | null;
  completionAt: number | null;
  createdAt: number;
  parent: TaskRuleParent;
  projectTitle: string;
  areaTitle: string;
};

export const taskRuleSchema: ItemSchema = {
  title: { type: 'string' },
  notes: { type: 'string' },
  status: { type: 'enum', values: ['created', 'completed', 'canceled'] },
  tags: { type: 'list' },
  startDate: { type: 'number' },
  dueDate: { type: 'number' },
  completionAt: { type: 'number' },
  createdAt: { type: 'number' },
  parent: { type: 'enum', values: ['inbox', 'project', 'area', 'heading', 'task'] },
  projectTitle: { type: 'string' },
  areaTitle: { type: 'string' },
};

export interface TaskRuleContext {
  parent: TaskRuleParent;
  projectTitle: string;
  areaTitle: string;
}

export function buildTaskRuleItem(task: TaskSchema, ctx: TaskRuleContext): TaskRuleItem {
  return {
    title: task.title,
    notes: task.notes ?? '',
    status: task.status,
    tags: task.tags,
    startDate: task.startDate ?? null,
    dueDate: task.dueDate ?? null,
    completionAt: task.completionAt ?? null,
    createdAt: task.createdAt,
    parent: ctx.parent,
    projectTitle: ctx.projectTitle,
    areaTitle: ctx.areaTitle,
  };
}
