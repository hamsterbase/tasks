import { format } from 'date-fns';

export function formatTimeStampToDate(timestamp: number) {
  return format(timestamp, 'yyyy-MM-dd');
}

/**
 * 格式化时间戳为 YYYY-MM-DD 格式
 * 如果时间戳为空或 0，返回 null
 */
export function formatOptionalTimeStampToDate(timestamp?: number | null): string | null {
  if (!timestamp) return null;
  return format(timestamp, 'yyyy-MM-dd');
}
