import { TaskModel } from '@/core/model';
import { BatchEditParams, BatchEditParamsSchema, BatchEditAction } from './types';
import { executeAddTask } from './actions/addTask';
import { executeAddHeading } from './actions/addHeading';
import { executeUpdateTask } from './actions/updateTask';
import { executeUpdateHeading } from './actions/updateHeading';
import { executeUpdateProject } from './actions/updateProject';
import { executeUpdateArea } from './actions/updateArea';
import { executeDeleteItem } from './actions/deleteItem';

export interface BatchEditResult {
  success: boolean;
  groupsProcessed: number;
  actionsProcessed: number;
}

/**
 * 执行批量编辑操作
 *
 * @param model TaskModel 实例
 * @param params 批量编辑参数
 * @returns 执行结果
 */
export function batchEdit(model: TaskModel, params: BatchEditParams): BatchEditResult {
  // 使用 zod 校验参数
  const validatedParams = BatchEditParamsSchema.parse(params);

  let actionsProcessed = 0;

  for (const group of validatedParams.groups) {
    for (const action of group.actions) {
      executeAction(model, action);
      actionsProcessed++;
    }
  }

  return {
    success: true,
    groupsProcessed: validatedParams.groups.length,
    actionsProcessed,
  };
}

/**
 * 执行单个 action
 */
function executeAction(model: TaskModel, action: BatchEditAction): void {
  switch (action.type) {
    case 'addTask':
      executeAddTask(model, action);
      break;
    case 'addHeading':
      executeAddHeading(model, action);
      break;
    case 'updateTask':
      executeUpdateTask(model, action);
      break;
    case 'updateHeading':
      executeUpdateHeading(model, action);
      break;
    case 'updateProject':
      executeUpdateProject(model, action);
      break;
    case 'updateArea':
      executeUpdateArea(model, action);
      break;
    case 'deleteItem':
      executeDeleteItem(model, action);
      break;
    default: {
      // TypeScript exhaustive check
      const _exhaustiveCheck: never = action;
      throw new Error(`Unknown action type: ${(_exhaustiveCheck as { type: string }).type}`);
    }
  }
}

// 导出所有类型和 schema
export * from './types';
export { BatchEditValidationError } from './validation';
