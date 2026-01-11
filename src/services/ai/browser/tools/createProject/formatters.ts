import { CreateProjectToolParams } from './createProject';

/**
 * 格式化任务日期为可读字符串
 */
function formatTaskDates(startDate?: string, dueDate?: string): string {
  const dates: string[] = [];
  if (startDate) dates.push(`Start: ${startDate}`);
  if (dueDate) dates.push(`Due: ${dueDate}`);
  return dates.length > 0 ? ` (${dates.join(' | ')})` : '';
}

/**
 * 格式化 createProject 工具的参数为可读字符串
 */
export function formatCreateProjectArguments(args: CreateProjectToolParams): string {
  const lines: string[] = [];
  lines.push(`Project: ${args.title}`);

  if (args.startDate || args.dueDate) {
    const dates: string[] = [];
    if (args.startDate) dates.push(`Start: ${args.startDate}`);
    if (args.dueDate) dates.push(`Due: ${args.dueDate}`);
    lines.push(dates.join(' | '));
  }

  if (args.children && args.children.length > 0) {
    lines.push('');
    lines.push('Tasks:');
    for (const child of args.children) {
      if (child.type === 'task') {
        let taskLine = `  - ${child.title}`;
        taskLine += formatTaskDates(child.startDate, child.dueDate);
        lines.push(taskLine);
      } else {
        lines.push(`  [${child.title}]`);
        if (child.children) {
          for (const task of child.children) {
            let taskLine = `    - ${task.title}`;
            taskLine += formatTaskDates(task.startDate, task.dueDate);
            lines.push(taskLine);
          }
        }
      }
    }
  }

  return lines.join('\n');
}

/**
 * 格式化 createProject 工具的执行结果
 */
export function formatCreateProjectResult(projectTitle: string): string {
  return `Created project: ${projectTitle}`;
}
