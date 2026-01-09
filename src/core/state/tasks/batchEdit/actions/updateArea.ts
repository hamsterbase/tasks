import { TaskModel } from '@/core/model';
import { ItemPosition } from '@/core/type';
import { TreeID } from 'loro-crdt';
import { UpdateAreaAction, ItemPosition as SchemaItemPosition } from '../types';
import { validateItemExists, validatePosition, BatchEditValidationError } from '../validation';

/**
 * 将 schema 中的 ItemPosition 转换为核心类型的 ItemPosition
 */
function toItemPosition(position: SchemaItemPosition | undefined): ItemPosition | undefined {
  if (!position) return undefined;
  return position as unknown as ItemPosition;
}

/**
 * 执行更新 area 操作
 */
export function executeUpdateArea(model: TaskModel, action: UpdateAreaAction): void {
  const modelData = model.toJSON();

  // 校验 area 存在
  const area = validateItemExists(modelData, action.areaId, 'Area');
  if (area.type !== 'area') {
    throw new BatchEditValidationError(`Item "${action.areaId}" is not an area`);
  }

  // 校验 position
  if (action.position) {
    validatePosition(modelData, action.position);
  }

  // 执行更新
  model.updateArea(action.areaId as TreeID, {
    title: action.title,
    position: toItemPosition(action.position),
  });
}
