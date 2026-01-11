import { TaskModel } from '@/core/model';
import { getUTCTimeStampFromDateStr } from '@/core/time/getUTCTimeStampFromDateStr';
import { ItemPosition } from '@/core/type';
import { TreeID } from 'loro-crdt';
import {
  CreateProjectWithChildrenParams,
  CreateTaskItem,
  CreateHeadingItem,
  createProjectWithChildrenParamsSchema,
} from './types';

/**
 * 将日期字符串转换为 UTC 时间戳
 */
function convertDateStr(dateStr: string | undefined): number | undefined {
  if (dateStr === undefined) return undefined;
  return getUTCTimeStampFromDateStr(dateStr);
}

/**
 * 校验 position 参数中引用的元素是否存在
 */
function validatePosition(model: TaskModel, position: ItemPosition | undefined): void {
  if (!position) return;

  const modelData = model.toJSON();

  switch (position.type) {
    case 'firstElement':
      if (position.parentId) {
        if (!modelData.taskObjectMap.has(position.parentId)) {
          throw new Error(`Invalid position: parentId "${position.parentId}" does not exist`);
        }
      }
      break;
    case 'afterElement':
      if (!modelData.taskObjectMap.has(position.previousElementId)) {
        throw new Error(`Invalid position: previousElementId "${position.previousElementId}" does not exist`);
      }
      break;
    case 'beforeElement':
      if (!modelData.taskObjectMap.has(position.nextElementId)) {
        throw new Error(`Invalid position: nextElementId "${position.nextElementId}" does not exist`);
      }
      break;
  }
}

/**
 * 校验所有参数
 */
function validateParams(model: TaskModel, params: CreateProjectWithChildrenParams): void {
  // 校验 position
  validatePosition(model, params.position as ItemPosition | undefined);
}

/**
 * 添加子任务（string[] 形式）
 * 按正确顺序添加：从后往前使用 firstElement
 */
function addSubtasks(model: TaskModel, parentTaskId: TreeID, subtaskTitles: string[]): void {
  // 从后往前添加，保证最终顺序正确
  for (let i = subtaskTitles.length - 1; i >= 0; i--) {
    model.addTask({
      title: subtaskTitles[i],
      position: { type: 'firstElement', parentId: parentTaskId },
    });
  }
}

/**
 * 添加任务
 */
function addTask(model: TaskModel, parentId: TreeID, task: CreateTaskItem, afterElementId?: TreeID): TreeID {
  const position: ItemPosition = afterElementId
    ? { type: 'afterElement', previousElementId: afterElementId }
    : { type: 'firstElement', parentId };

  const taskId = model.addTask({
    title: task.title,
    startDate: convertDateStr(task.startDate),
    dueDate: convertDateStr(task.dueDate),
    position,
  });

  // 添加子任务
  if (task.children && task.children.length > 0) {
    addSubtasks(model, taskId, task.children);
  }

  return taskId;
}

/**
 * 添加 heading 及其子任务
 */
function addHeading(model: TaskModel, parentId: TreeID, heading: CreateHeadingItem, afterElementId?: TreeID): TreeID {
  const position: ItemPosition = afterElementId
    ? { type: 'afterElement', previousElementId: afterElementId }
    : { type: 'firstElement', parentId };

  const headingId = model.addProjectHeading({
    title: heading.title,
    position,
  });

  // 添加 heading 下的任务（从后往前保证顺序）
  if (heading.children && heading.children.length > 0) {
    for (let i = heading.children.length - 1; i >= 0; i--) {
      const task = heading.children[i];
      const taskId = model.addTask({
        title: task.title,
        startDate: convertDateStr(task.startDate),
        dueDate: convertDateStr(task.dueDate),
        position: { type: 'firstElement', parentId: headingId },
      });

      // 添加子任务
      if (task.children && task.children.length > 0) {
        addSubtasks(model, taskId, task.children);
      }
    }
  }

  return headingId;
}

/**
 * 创建带子项的 project
 *
 * @param model TaskModel 实例
 * @param params 创建参数
 * @returns 创建的 project ID
 *
 * @example
 * ```typescript
 * const projectId = createProjectWithChildren(model, {
 *   title: 'My Project',
 *   children: [
 *     { type: 'task', title: 'Task 1' },
 *     { type: 'heading', title: 'Phase 1', children: [
 *       { title: 'Sub Task 1' },
 *     ]},
 *   ],
 * });
 * ```
 */
export function createProjectWithChildren(model: TaskModel, params: CreateProjectWithChildrenParams): TreeID {
  // 使用 zod 校验参数格式
  const parseResult = createProjectWithChildrenParamsSchema.safeParse(params);
  if (!parseResult.success) {
    throw new Error(`Invalid params: ${parseResult.error.message}`);
  }

  // 校验业务规则
  validateParams(model, params);

  // 创建 project
  const projectId = model.addProject({
    title: params.title,
    position: params.position as ItemPosition | undefined,
  });

  // 更新 project 日期
  if (params.startDate || params.dueDate) {
    model.updateProject(projectId, {
      startDate: convertDateStr(params.startDate),
      dueDate: convertDateStr(params.dueDate),
    });
  }

  // 添加 children（按正确顺序）
  if (params.children && params.children.length > 0) {
    // 策略：使用 afterElement 从前往后依次添加
    // 先添加第一个，然后后续的都用 afterElement 跟在前一个后面
    let lastElementId: TreeID | undefined;

    for (const child of params.children) {
      if (child.type === 'task') {
        lastElementId = addTask(model, projectId, child, lastElementId);
      } else if (child.type === 'heading') {
        lastElementId = addHeading(model, projectId, child, lastElementId);
      }
    }
  }

  return projectId;
}
