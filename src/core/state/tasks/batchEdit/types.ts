import { z } from 'zod';

// ItemPosition schema (复用现有类型结构)
export const ItemPositionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('firstElement'),
    parentId: z.string().optional(),
  }),
  z.object({
    type: z.literal('afterElement'),
    previousElementId: z.string(),
  }),
  z.object({
    type: z.literal('beforeElement'),
    nextElementId: z.string(),
  }),
]);

// ===== Add Actions =====
export const AddTaskInHeadingSchema = z.object({
  title: z.string().describe('Task title'),
  startDate: z.number().optional().describe('Start date timestamp in milliseconds (UTC 0 timezone date)'),
  dueDate: z.number().optional().describe('Due date timestamp in milliseconds (UTC 0 timezone date)'),
  children: z.array(z.string()).optional().describe('Subtask titles'),
});

export const AddTaskActionSchema = z.object({
  type: z.literal('addTask'),
  title: z.string().describe('Task title'),
  position: ItemPositionSchema.describe('Position where to add the task'),
  startDate: z.number().optional().describe('Start date timestamp in milliseconds'),
  dueDate: z.number().optional().describe('Due date timestamp in milliseconds'),
  children: z.array(z.string()).optional().describe('Subtask titles'),
});

export const AddHeadingActionSchema = z.object({
  type: z.literal('addHeading'),
  title: z.string().describe('Heading title'),
  position: ItemPositionSchema.describe('Position where to add the heading'),
  children: z.array(AddTaskInHeadingSchema).optional().describe('Tasks under this heading'),
});

// ===== Update Actions =====
export const UpdateTaskActionSchema = z.object({
  type: z.literal('updateTask'),
  taskId: z.string().describe('Task ID to update'),
  title: z.string().optional().describe('New task title'),
  startDate: z.number().nullable().optional().describe('New start date (null to clear)'),
  dueDate: z.number().nullable().optional().describe('New due date (null to clear)'),
  status: z.enum(['completed', 'canceled', 'created']).optional().describe('New task status'),
  position: ItemPositionSchema.optional().describe('New position'),
});

export const UpdateHeadingActionSchema = z.object({
  type: z.literal('updateHeading'),
  headingId: z.string().describe('Heading ID to update'),
  title: z.string().optional().describe('New heading title'),
  position: ItemPositionSchema.optional().describe('New position'),
});

export const UpdateProjectActionSchema = z.object({
  type: z.literal('updateProject'),
  projectId: z.string().describe('Project ID to update'),
  title: z.string().optional().describe('New project title'),
  startDate: z.number().nullable().optional().describe('New start date (null to clear)'),
  dueDate: z.number().nullable().optional().describe('New due date (null to clear)'),
  position: ItemPositionSchema.optional().describe('New position'),
});

export const UpdateAreaActionSchema = z.object({
  type: z.literal('updateArea'),
  areaId: z.string().describe('Area ID to update'),
  title: z.string().optional().describe('New area title'),
  position: ItemPositionSchema.optional().describe('New position'),
});

// ===== Delete Action =====
export const DeleteItemActionSchema = z.object({
  type: z.literal('deleteItem'),
  itemId: z.string().describe('Item ID to delete (task, heading, project, or area)'),
});

// Combined action schema
export const BatchEditActionSchema = z.discriminatedUnion('type', [
  AddTaskActionSchema,
  AddHeadingActionSchema,
  UpdateTaskActionSchema,
  UpdateHeadingActionSchema,
  UpdateProjectActionSchema,
  UpdateAreaActionSchema,
  DeleteItemActionSchema,
]);

// Group schema
export const BatchEditGroupSchema = z.object({
  title: z.string().describe('Group title for user review'),
  actions: z.array(BatchEditActionSchema).describe('Actions in this group'),
});

// Main params schema
export const BatchEditParamsSchema = z.object({
  groups: z.array(BatchEditGroupSchema).describe('Groups of batch edit actions'),
});

// Export TypeScript types
export type ItemPosition = z.infer<typeof ItemPositionSchema>;
export type AddTaskInHeading = z.infer<typeof AddTaskInHeadingSchema>;
export type AddTaskAction = z.infer<typeof AddTaskActionSchema>;
export type AddHeadingAction = z.infer<typeof AddHeadingActionSchema>;
export type UpdateTaskAction = z.infer<typeof UpdateTaskActionSchema>;
export type UpdateHeadingAction = z.infer<typeof UpdateHeadingActionSchema>;
export type UpdateProjectAction = z.infer<typeof UpdateProjectActionSchema>;
export type UpdateAreaAction = z.infer<typeof UpdateAreaActionSchema>;
export type DeleteItemAction = z.infer<typeof DeleteItemActionSchema>;
export type BatchEditAction = z.infer<typeof BatchEditActionSchema>;
export type BatchEditGroup = z.infer<typeof BatchEditGroupSchema>;
export type BatchEditParams = z.infer<typeof BatchEditParamsSchema>;
