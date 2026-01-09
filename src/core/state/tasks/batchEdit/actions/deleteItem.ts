import { TaskModel } from '@/core/model';
import { TreeID } from 'loro-crdt';
import { DeleteItemAction } from '../types';
import { validateItemExists } from '../validation';

/**
 * 执行删除项目操作
 */
export function executeDeleteItem(model: TaskModel, action: DeleteItemAction): void {
  // 校验项目存在
  validateItemExists(model.toJSON(), action.itemId, 'Item');

  // 执行删除
  model.deleteItem(action.itemId as TreeID);
}
