import { TaskModel } from '@/core/model';
import { ItemPosition } from '@/core/type';
import { AddTaskAction, AddTaskInHeading, ItemPosition as SchemaItemPosition } from '../types';
import { validatePosition, convertDateString } from '../validation';
import { TreeID } from 'loro-crdt';

/**
 * 将 schema 中的 ItemPosition 转换为核心类型的 ItemPosition
 */
function toItemPosition(position: SchemaItemPosition): ItemPosition {
  return position as unknown as ItemPosition;
}

/**
 * 执行添加任务操作
 * 注意：当 position.type 为 'firstElement' 且需要保持顺序时，
 * 需要反向添加（从后往前）
 */
export function executeAddTask(model: TaskModel, action: AddTaskAction): TreeID {
  // 参数校验
  validatePosition(model.toJSON(), action.position);

  // 创建任务
  const taskId = model.addTask({
    title: action.title,
    position: toItemPosition(action.position),
    startDate: convertDateString(action.startDate),
    dueDate: convertDateString(action.dueDate),
  });

  // 添加子任务（从后往前添加以保持顺序）
  if (action.children && action.children.length > 0) {
    const reversedChildren = [...action.children].reverse();
    for (const childTitle of reversedChildren) {
      model.addTask({
        title: childTitle,
        position: { type: 'firstElement', parentId: taskId },
      });
    }
  }

  return taskId;
}

/**
 * 在 heading 下添加任务
 */
export function executeAddTaskInHeading(
  model: TaskModel,
  headingId: TreeID,
  task: AddTaskInHeading,
  previousTaskId?: TreeID
): TreeID {
  const position = previousTaskId
    ? { type: 'afterElement' as const, previousElementId: previousTaskId }
    : { type: 'firstElement' as const, parentId: headingId };

  const taskId = model.addTask({
    title: task.title,
    position,
    startDate: convertDateString(task.startDate),
    dueDate: convertDateString(task.dueDate),
  });

  // 添加子任务（从后往前添加以保持顺序）
  if (task.children && task.children.length > 0) {
    const reversedChildren = [...task.children].reverse();
    for (const childTitle of reversedChildren) {
      model.addTask({
        title: childTitle,
        position: { type: 'firstElement', parentId: taskId },
      });
    }
  }

  return taskId;
}
