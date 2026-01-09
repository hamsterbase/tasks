import { ITaskModelData, TaskObjectSchema } from '@/core/type';
import { ItemPosition } from './types';

export class BatchEditValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BatchEditValidationError';
  }
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

/**
 * 校验时间戳格式
 */
export function validateTimestamp(timestamp: number | null | undefined, fieldName: string): void {
  if (timestamp === null || timestamp === undefined) {
    return;
  }
  if (!Number.isInteger(timestamp) || timestamp < 0) {
    throw new BatchEditValidationError(`${fieldName} must be a valid positive integer timestamp, got: ${timestamp}`);
  }
}
