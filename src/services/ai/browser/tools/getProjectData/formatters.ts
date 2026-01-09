import { formatTimeStampToDate } from '@/core/time/formatTimeStampToDate';
import { GetProjectDataResult, TaskItem, HeadingItem } from './getProjectData';

export interface FormatGetProjectDataOptions {
  forUser: boolean;
}

function getStatusIcon(status: string): string {
  return status === 'completed' ? '✓' : status === 'canceled' ? '✗' : '○';
}

function formatTaskLine(task: TaskItem, options: FormatGetProjectDataOptions, indent: string = ''): string[] {
  const { forUser } = options;
  const lines: string[] = [];

  const taskIcon = getStatusIcon(task.status);
  const idPart = forUser ? '' : `[${task.id}] `;
  let taskLine = `${indent}- ${taskIcon} ${idPart}${task.title}`;
  if (task.dueDate) {
    taskLine += ` (due: ${formatTimeStampToDate(task.dueDate)})`;
  }
  lines.push(taskLine);

  // Subtasks
  if (task.children && task.children.length > 0) {
    for (const child of task.children) {
      const childIcon = getStatusIcon(child.status);
      const childIdPart = forUser ? '' : `[${child.id}] `;
      lines.push(`${indent}  - ${childIcon} ${childIdPart}${child.title}`);
    }
  }

  return lines;
}

function formatHeading(heading: HeadingItem, options: FormatGetProjectDataOptions): string[] {
  const { forUser } = options;
  const lines: string[] = [];

  const idPart = forUser ? '' : `[${heading.id}] `;
  lines.push('');
  lines.push(`### ${idPart}${heading.title}`);

  if (heading.tasks.length === 0) {
    lines.push('No tasks in this section.');
  } else {
    for (const task of heading.tasks) {
      lines.push(...formatTaskLine(task, options));
    }
  }

  return lines;
}

export function formatGetProjectDataResult(result: GetProjectDataResult, options: FormatGetProjectDataOptions): string {
  if ('error' in result) {
    return `Error: ${result.error}`;
  }

  const { project } = result;
  const { forUser } = options;
  const lines: string[] = [];

  // Project header
  const statusIcon = getStatusIcon(project.status);
  const idPart = forUser ? '' : `[${project.id}] `;
  lines.push(`# ${statusIcon} ${idPart}${project.title}`);

  if (project.startDate || project.dueDate) {
    const dates: string[] = [];
    if (project.startDate) {
      dates.push(`Start: ${formatTimeStampToDate(project.startDate)}`);
    }
    if (project.dueDate) {
      dates.push(`Due: ${formatTimeStampToDate(project.dueDate)}`);
    }
    lines.push(dates.join(' | '));
  }

  if (project.tags.length > 0) {
    lines.push(`Tags: ${project.tags.join(', ')}`);
  }

  if (project.notes) {
    lines.push('');
    lines.push(`Notes: ${project.notes}`);
  }

  lines.push('');
  lines.push('## Items');

  if (project.items.length === 0) {
    lines.push('No items in this project.');
  } else {
    for (const item of project.items) {
      if (item.type === 'task') {
        lines.push(...formatTaskLine(item, options));
      } else {
        lines.push(...formatHeading(item, options));
      }
    }
  }

  return lines.join('\n');
}
