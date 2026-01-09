import { z } from 'zod';

// Zod schema for tool call meta information
export const toolMetaSchema = z.object({
  title: z.string().describe('A short title (under 20 characters) describing what this tool call does'),
});

// TypeScript type derived from zod schema
export type ToolCallMeta = z.infer<typeof toolMetaSchema>;

// JSON schema for _meta field (shared by all tools)
export const TOOL_META_SCHEMA = z.toJSONSchema(toolMetaSchema);
