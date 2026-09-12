import { z } from 'zod';
import { stripItemIdPrefix } from '../../base/common/itemId';

export const instanceSchema = z.string().trim().min(1).optional();

export const explanationSchema = {
  explanation: z.string().optional(),
  'explanation-images': z.string().optional(),
};

/** Shared flags for commands that submit a desktop approval request. */
export const approvalCommandSchema = z
  .object({
    instance: instanceSchema,
    ...explanationSchema,
  })
  .strict();

/**
 * Single-value id. Commas are rejected outright so a caller that passes a list
 * gets "expects a single id" instead of a confusing "task <a,b> not found".
 * Use {@link idsSchema} for the commands that really do take several ids.
 *
 * A leading `HT#` — the form the desktop app copies to the clipboard — is
 * dropped, so commands always see a bare uid.
 */
export const idSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !value.includes(','), 'expects a single id, not a comma-separated list')
  .transform(stripItemIdPrefix);
export const titleSchema = z.string().trim().min(1);

export const idsSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) =>
      value
        .split(',')
        .map((id) => id.trim())
        .every(Boolean),
    'must be one or more comma-separated ids'
  );

export const positionSchema = z
  .string()
  .trim()
  .regex(
    /^(?:firstElement(?::(?:root|inbox|[^:]+))?|afterElement:[^:]+|beforeElement:[^:]+)$/,
    'must be firstElement:<parent-id>, afterElement:<sibling-id>, or beforeElement:<sibling-id>'
  );

function validDate(value: string): boolean {
  if (value === 'today' || value === 'none') {
    return true;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }
  const timestamp = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const parsed = new Date(timestamp);
  return (
    parsed.getUTCFullYear() === Number(match[1]) &&
    parsed.getUTCMonth() === Number(match[2]) - 1 &&
    parsed.getUTCDate() === Number(match[3])
  );
}

export const dateSchema = z.string().refine(validDate, 'must be YYYY-MM-DD, today, or none');
export const statusSchema = z.enum(['complete', 'completed', 'canceled', 'cancelled', 'created']);

export const visibilitySchema = {
  instance: instanceSchema,
  'show-future': z.boolean().optional(),
  'show-completed': z.boolean().optional(),
};
