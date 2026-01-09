import { TaskModel } from '@/core/model';
import { ItemPosition } from '@/core/type';
import { TreeID } from 'loro-crdt';
import { UpdateHeadingAction, ItemPosition as SchemaItemPosition } from '../types';
import { validateItemExists, validatePosition, BatchEditValidationError } from '../validation';

/**
 * 将 schema 中的 ItemPosition 转换为核心类型的 ItemPosition
 */
function toItemPosition(position: SchemaItemPosition | undefined): ItemPosition | undefined {
  if (!position) return undefined;
  return position as unknown as ItemPosition;
}

/**
 * 执行更新 heading 操作
 */
export function executeUpdateHeading(model: TaskModel, action: UpdateHeadingAction): void {
  const modelData = model.toJSON();

  // 校验 heading 存在
  const heading = validateItemExists(modelData, action.headingId, 'Heading');
  if (heading.type !== 'projectHeading') {
    throw new BatchEditValidationError(`Item "${action.headingId}" is not a heading`);
  }

  // 校验 position
  if (action.position) {
    validatePosition(modelData, action.position);
  }

  // 执行更新
  model.updateProjectHeading(action.headingId as TreeID, {
    title: action.title,
    position: toItemPosition(action.position),
  });
}
