import { TaskModel } from '@/core/model';
import { ItemPosition } from '@/core/type';
import { AddHeadingAction, ItemPosition as SchemaItemPosition } from '../types';
import { validatePosition } from '../validation';
import { executeAddTaskInHeading } from './addTask';
import { TreeID } from 'loro-crdt';

/**
 * 将 schema 中的 ItemPosition 转换为核心类型的 ItemPosition
 */
function toItemPosition(position: SchemaItemPosition): ItemPosition {
  return position as unknown as ItemPosition;
}

/**
 * 执行添加 heading 操作
 */
export function executeAddHeading(model: TaskModel, action: AddHeadingAction): TreeID {
  // 参数校验
  validatePosition(model.toJSON(), action.position);

  // 创建 heading
  const headingId = model.addProjectHeading({
    title: action.title,
    position: toItemPosition(action.position),
  });

  // 添加子任务
  if (action.children && action.children.length > 0) {
    let previousTaskId: TreeID | undefined;
    for (const task of action.children) {
      previousTaskId = executeAddTaskInHeading(model, headingId, task, previousTaskId);
    }
  }

  return headingId;
}
