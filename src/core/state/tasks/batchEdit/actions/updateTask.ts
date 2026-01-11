import { TaskModel } from '@/core/model';
import { ItemPosition } from '@/core/type';
import { TreeID } from 'loro-crdt';
import { UpdateTaskAction, ItemPosition as SchemaItemPosition } from '../types';
import { validateItemExists, validatePosition, convertDateString, BatchEditValidationError } from '../validation';

/**
 * 将 schema 中的 ItemPosition 转换为核心类型的 ItemPosition
 */
function toItemPosition(position: SchemaItemPosition | undefined): ItemPosition | undefined {
  if (!position) return undefined;
  return position as unknown as ItemPosition;
}

/**
 * 执行更新任务操作
 */
export function executeUpdateTask(model: TaskModel, action: UpdateTaskAction): void {
  const modelData = model.toJSON();

  // 校验任务存在
  const task = validateItemExists(modelData, action.taskId, 'Task');
  if (task.type !== 'task') {
    throw new BatchEditValidationError(`Item "${action.taskId}" is not a task`);
  }

  // 校验 position
  if (action.position) {
    validatePosition(modelData, action.position);
  }

  // 执行更新
  model.updateTask(action.taskId as TreeID, {
    title: action.title,
    startDate: convertDateString(action.startDate),
    dueDate: convertDateString(action.dueDate),
    status: action.status,
    position: toItemPosition(action.position),
  });
}
