import { z } from 'zod';

// 位置 schema - 基于 ItemPosition 类型
const firstElementPositionSchema = z.object({
  type: z.literal('firstElement'),
  parentId: z.string().optional(),
});

const afterElementPositionSchema = z.object({
  type: z.literal('afterElement'),
  previousElementId: z.string(),
});

const beforeElementPositionSchema = z.object({
  type: z.literal('beforeElement'),
  nextElementId: z.string(),
});

export const itemPositionSchema = z.discriminatedUnion('type', [
  firstElementPositionSchema,
  afterElementPositionSchema,
  beforeElementPositionSchema,
]);

// 创建任务项 schema
export const createTaskItemSchema = z.object({
  type: z.literal('task'),
  title: z.string().describe('Task title'),
  startDate: z.string().optional().describe('Start date in yyyy-MM-dd format'),
  dueDate: z.string().optional().describe('Due date in yyyy-MM-dd format'),
  children: z.array(z.string()).optional().describe('Subtask titles'),
});

// 创建 heading 项 schema
export const createHeadingItemSchema = z.object({
  type: z.literal('heading'),
  title: z.string().describe('Heading title'),
  children: z
    .array(createTaskItemSchema.omit({ type: true }))
    .optional()
    .describe('Tasks under this heading'),
});

// 子项 schema（task 或 heading）
export const childItemSchema = z.discriminatedUnion('type', [createTaskItemSchema, createHeadingItemSchema]);

// 创建 project 参数 schema
export const createProjectWithChildrenParamsSchema = z.object({
  title: z.string().describe('Project title'),
  startDate: z.string().optional().describe('Start date in yyyy-MM-dd format'),
  dueDate: z.string().optional().describe('Due date in yyyy-MM-dd format'),
  position: itemPositionSchema.optional().describe('Position to create the project'),
  children: z.array(childItemSchema).optional().describe('Tasks and headings in the project'),
});

// TypeScript 类型导出
export type ItemPositionParam = z.infer<typeof itemPositionSchema>;
export type CreateTaskItem = z.infer<typeof createTaskItemSchema>;
export type CreateHeadingItem = z.infer<typeof createHeadingItemSchema>;
export type ChildItem = z.infer<typeof childItemSchema>;
export type CreateProjectWithChildrenParams = z.infer<typeof createProjectWithChildrenParamsSchema>;
