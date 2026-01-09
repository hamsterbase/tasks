import { formatTimeStampToDate } from '@/core/time/formatTimeStampToDate';
import { GetDataResult } from './getData';

export interface FormatGetDataOptions {
  /** If true, output is for user display (no IDs). If false, output includes IDs for AI. */
  forUser: boolean;
}

export function formatGetDataResult(result: GetDataResult, options: FormatGetDataOptions): string {
  const { forUser } = options;
  const lines: string[] = [];

  lines.push(`Today: ${formatTimeStampToDate(result.today)}`);
  lines.push('');

  // Inbox
  lines.push(`## Inbox (${result.inbox.length} tasks)`);
  if (result.inbox.length === 0) {
    lines.push('No tasks in inbox.');
  } else {
    for (const task of result.inbox) {
      const idPart = forUser ? '' : `[${task.id}] `;
      let taskLine = `- ${idPart}${task.title}`;
      if (task.dueDate) {
        taskLine += ` (due: ${formatTimeStampToDate(task.dueDate)})`;
      }
      lines.push(taskLine);
    }
  }
  lines.push('');

  // Projects
  lines.push(`## Projects (${result.projects.length})`);
  if (result.projects.length === 0) {
    lines.push('No projects.');
  } else {
    for (const project of result.projects) {
      const statusIcon = project.status === 'completed' ? '✓' : project.status === 'canceled' ? '✗' : '○';
      const idPart = forUser ? '' : `[${project.id}] `;
      lines.push(`- ${statusIcon} ${idPart}${project.title} [${project.completedCount}/${project.taskCount}]`);
    }
  }
  lines.push('');

  // Areas
  lines.push(`## Areas (${result.areas.length})`);
  if (result.areas.length === 0) {
    lines.push('No areas.');
  } else {
    for (const area of result.areas) {
      const idPart = forUser ? '' : `[${area.id}] `;
      lines.push(`- ${idPart}${area.title} (${area.projectCount} projects)`);
    }
  }
  lines.push('');

  // Upcoming
  lines.push(`## Upcoming (${result.upcoming.length} items)`);
  if (result.upcoming.length === 0) {
    lines.push('No upcoming items.');
  } else {
    for (const item of result.upcoming) {
      const idPart = forUser ? '' : `[${item.id}] `;
      let itemLine = `- ${idPart}${item.title}`;
      if (item.projectTitle) {
        itemLine += ` [${item.projectTitle}]`;
      }
      if (item.dueDate) {
        itemLine += ` (due: ${formatTimeStampToDate(item.dueDate)})`;
      } else if (item.startDate) {
        itemLine += ` (start: ${formatTimeStampToDate(item.startDate)})`;
      }
      lines.push(itemLine);
    }
  }

  return lines.join('\n');
}
