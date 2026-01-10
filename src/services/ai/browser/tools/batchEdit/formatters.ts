import { BatchEditParams } from '@/core/state/tasks/batchEdit/types';
import { BatchEditResult } from '@/core/state/tasks/batchEdit/batchEdit';
import { formatOptionalTimeStampToDate } from '@/core/time/formatTimeStampToDate';
import { ITaskModelData } from '@/core/type';

/**
 * 将内部类型名映射为显示名称
 */
function getTypeDisplayName(type: string): string {
  switch (type) {
    case 'task':
      return 'Task';
    case 'project':
      return 'Project';
    case 'area':
      return 'Area';
    case 'projectHeading':
      return 'Heading';
    default:
      return type;
  }
}

/**
 * 获取项目标题，如果获取不到则降级显示 ID
 */
function getItemTitle(modelState: ITaskModelData | undefined, itemId: string): string {
  if (!modelState) {
    return `[${itemId}]`;
  }
  const item = modelState.taskObjectMap.get(itemId);
  return item ? `"${item.title}"` : `[${itemId}]`;
}

/**
 * 格式化单个 action 为可读字符串
 * @returns 格式化后的字符串，如果 action 应被忽略则返回 null
 */
export function formatAction(
  action: BatchEditParams['groups'][0]['actions'][0],
  modelState?: ITaskModelData
): string | null {
  switch (action.type) {
    case 'addTask': {
      let line = `  + Task: ${action.title}`;
      if (action.dueDate) line += ` (due: ${formatOptionalTimeStampToDate(action.dueDate)})`;
      if (action.children && action.children.length > 0) {
        line += `\n    Subtasks: ${action.children.join(', ')}`;
      }
      return line;
    }
    case 'addHeading': {
      let line = `  + Heading: [${action.title}]`;
      if (action.children && action.children.length > 0) {
        line += `\n    Tasks: ${action.children.map((t) => t.title).join(', ')}`;
      }
      return line;
    }
    case 'updateTask': {
      const updates: string[] = [];
      if (action.title) updates.push(`title="${action.title}"`);
      if (action.status) updates.push(`status=${action.status}`);
      if (action.startDate !== undefined) {
        updates.push(
          `startDate=${action.startDate === null ? 'clear' : formatOptionalTimeStampToDate(action.startDate)}`
        );
      }
      if (action.dueDate !== undefined) {
        updates.push(`dueDate=${action.dueDate === null ? 'clear' : formatOptionalTimeStampToDate(action.dueDate)}`);
      }
      if (action.position) updates.push('position=moved');
      return `  ~ Task ${getItemTitle(modelState, action.taskId)}: ${updates.join(', ')}`;
    }
    case 'updateHeading': {
      const updates: string[] = [];
      if (action.title) updates.push(`title="${action.title}"`);
      if (action.position) updates.push('position=moved');
      return `  ~ Heading ${getItemTitle(modelState, action.headingId)}: ${updates.join(', ')}`;
    }
    case 'updateProject': {
      const updates: string[] = [];
      if (action.title) updates.push(`title="${action.title}"`);
      if (action.startDate !== undefined) {
        updates.push(
          `startDate=${action.startDate === null ? 'clear' : formatOptionalTimeStampToDate(action.startDate)}`
        );
      }
      if (action.dueDate !== undefined) {
        updates.push(`dueDate=${action.dueDate === null ? 'clear' : formatOptionalTimeStampToDate(action.dueDate)}`);
      }
      if (action.position) updates.push('position=moved');
      return `  ~ Project ${getItemTitle(modelState, action.projectId)}: ${updates.join(', ')}`;
    }
    case 'updateArea': {
      const updates: string[] = [];
      if (action.title) updates.push(`title="${action.title}"`);
      if (action.position) updates.push('position=moved');
      return `  ~ Area ${getItemTitle(modelState, action.areaId)}: ${updates.join(', ')}`;
    }
    case 'deleteItem': {
      if (!modelState) {
        return null;
      }
      const item = modelState.taskObjectMap.get(action.itemId);
      if (!item) {
        return null;
      }
      const typeName = getTypeDisplayName(item.type);
      return `  - Delete: ${typeName} "${item.title}"`;
    }
    default: {
      return '  ? Unknown action';
    }
  }
}

/**
 * 按 group.title 分组格式化显示批量操作内容
 */
export function formatBatchEditArguments(args: BatchEditParams, modelState?: ITaskModelData): string {
  const lines: string[] = [];

  for (const group of args.groups) {
    const groupLines: string[] = [];
    for (const action of group.actions) {
      const formatted = formatAction(action, modelState);
      if (formatted !== null) {
        groupLines.push(formatted);
      }
    }
    if (groupLines.length > 0) {
      lines.push(`[${group.title}]`);
      lines.push(...groupLines);
      lines.push('');
    }
  }

  // 移除末尾空行
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines.join('\n');
}

/**
 * 格式化执行结果
 */
export function formatBatchEditResult(result: BatchEditResult): string {
  return `Batch edit completed: ${result.groupsProcessed} groups, ${result.actionsProcessed} actions processed`;
}
