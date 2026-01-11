import { TaskModel } from '@/core/model';
import { ItemPosition } from '@/core/type';
import { TreeID } from 'loro-crdt';
import { UpdateProjectAction, ItemPosition as SchemaItemPosition } from '../types';
import { validateItemExists, validatePosition, convertDateString, BatchEditValidationError } from '../validation';

/**
 * 将 schema 中的 ItemPosition 转换为核心类型的 ItemPosition
 */
function toItemPosition(position: SchemaItemPosition | undefined): ItemPosition | undefined {
  if (!position) return undefined;
  return position as unknown as ItemPosition;
}

/**
 * 执行更新 project 操作
 */
export function executeUpdateProject(model: TaskModel, action: UpdateProjectAction): void {
  const modelData = model.toJSON();

  // 校验 project 存在
  const project = validateItemExists(modelData, action.projectId, 'Project');
  if (project.type !== 'project') {
    throw new BatchEditValidationError(`Item "${action.projectId}" is not a project`);
  }

  // 校验 position
  if (action.position) {
    validatePosition(modelData, action.position);
  }

  // 执行更新
  model.updateProject(action.projectId as TreeID, {
    title: action.title,
    startDate: convertDateString(action.startDate),
    dueDate: convertDateString(action.dueDate),
    position: toItemPosition(action.position),
  });
}
