import type { TagFilter } from '@/core/state/getProjectHeadingAndTasks';

export type { TagFilter };

export const TAG_FILTER_ALL: TagFilter = { type: 'all' };
export const TAG_FILTER_UNTAGGED: TagFilter = { type: 'untagged' };

export function isSameTagFilter(a: TagFilter, b: TagFilter): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'tag' && b.type === 'tag') return a.value === b.value;
  return true;
}
