import { ITaskModelData, TaskObjectSchema } from '@/core/type';
import { getUTCTimeStampFromDateStr } from '@/core/time/getUTCTimeStampFromDateStr';
import { ItemPosition } from './types';

export class BatchEditValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BatchEditValidationError';
  }
}

/**
 * 将日期字符串转换为 UTC 时间戳
 * 支持 null（用于清除日期）和 undefined（未提供）
 */
export function convertDateString(dateStr: string | null | undefined): number | null | undefined {
  if (dateStr === null) return null;
  if (dateStr === undefined) return undefined;
  return getUTCTimeStampFromDateStr(dateStr);
}

/**
 * 校验元素是否存在
 */
export function validateItemExists(modelData: ITaskModelData, itemId: string, itemType: string): TaskObjectSchema {
  const item = modelData.taskObjectMap.get(itemId);
  if (!item) {
    throw new BatchEditValidationError(`${itemType} with ID "${itemId}" does not exist`);
  }
  return item;
}

/**
 * 校验 position 引用的元素是否存在
 */
export function validatePosition(modelData: ITaskModelData, position: ItemPosition): void {
  switch (position.type) {
    case 'firstElement':
      if (position.parentId) {
        validateItemExists(modelData, position.parentId, 'Parent element');
      }
      break;
    case 'afterElement':
      validateItemExists(modelData, position.previousElementId, 'Previous element');
      break;
    case 'beforeElement':
      validateItemExists(modelData, position.nextElementId, 'Next element');
      break;
  }
}
