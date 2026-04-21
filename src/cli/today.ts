import { TaskModel } from '../core/model';
import { TaskSchema } from '../core/type';

export interface TodayTask {
  id: string;
  title: string;
  projectTitle: string;
  startDate?: number;
  dueDate?: number;
  tags: string[];
  isOverdue: boolean;
}

function getTodayUtc(): number {
  const d = new Date();
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getTodayTasks(model: TaskModel): TodayTask[] {
  const today = getTodayUtc();
  const data = model.toJSON();
  const dateAssigned = data.dateAssignedList;
  const out: TodayTask[] = [];

  for (const id of dateAssigned) {
    const obj = data.taskObjectMap.get(id);
    if (!obj || obj.type !== 'task') continue;
    const task = obj as TaskSchema;
    if (task.status !== 'created') continue;

    const matchesDue = task.dueDate !== undefined && task.dueDate <= today;
    const matchesStart = !matchesDue && task.startDate !== undefined && task.startDate <= today;
    if (!matchesDue && !matchesStart) continue;

    let projectTitle = '';
    if (task.parentId) {
      const parent = data.taskObjectMap.get(task.parentId);
      if (parent?.type === 'project') projectTitle = parent.title;
      else if (parent?.type === 'projectHeading') {
        const proj = data.taskObjectMap.get(parent.parentId);
        projectTitle = proj?.type === 'project' ? proj.title : '';
      }
    }

    out.push({
      id: task.id,
      title: task.title,
      projectTitle,
      startDate: task.startDate,
      dueDate: task.dueDate,
      tags: task.tags,
      isOverdue: task.dueDate !== undefined && task.dueDate < today,
    });
  }

  return out;
}

export function formatDue(task: TodayTask): string {
  const today = getTodayUtc();
  if (task.dueDate !== undefined) {
    if (task.dueDate < today) return 'overdue!';
    if (task.dueDate === today) return 'today';
    return utcToDateStr(task.dueDate);
  }
  if (task.startDate !== undefined) {
    if (task.startDate <= today) return 'today';
    return utcToDateStr(task.startDate);
  }
  return '';
}

function utcToDateStr(utcMs: number): string {
  const d = new Date(utcMs);
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}-${m}-${day}`;
}
