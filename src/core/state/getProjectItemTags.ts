import { getParentDisplay } from '@/core/state/getParentDisplay';
import { ITaskModelData } from '@/core/state/type';
import { formatCompletionAt } from '@/core/time/formatCompletionAt';
import { formatDueDateInList } from '@/core/time/formatDueDateInList';
import { formatStartDateInList } from '@/core/time/formatStartDateInList';
import { isPastOrToday } from '@/core/time/isPast';
import { TreeID } from 'loro-crdt';
import { getProject } from './getProject';

interface ResultItem {
  icon: {
    type: string;
    props?: Record<string, unknown>;
  };
  label: string;
}

interface TaskItemTagsOptions {
  hideParent: boolean;
  projectId: TreeID;
}

export function getProjectItemTags(model: ITaskModelData, options: TaskItemTagsOptions): ResultItem[] {
  const project = getProject(model, options.projectId);
  const res: ResultItem[] = [];
  if (!options.hideParent) {
    const parentDisplayData = getParentDisplay(model, options.projectId);
    if (parentDisplayData) {
      res.push({
        icon: {
          type: 'AreaIcon',
        },
        label: parentDisplayData.title,
      });
    }
  }

  if (project.dueDate) {
    res.push({
      icon: {
        type: 'DueIcon',
      },
      label: formatDueDateInList(project.dueDate),
    });
  }

  if (project.startDate && !isPastOrToday(project.startDate)) {
    res.push({
      icon: {
        type: 'CalendarRangeIcon',
      },
      label: formatStartDateInList(project.startDate),
    });
  }

  if (project.completionAt && project.status !== 'created') {
    const isCompleted = project.status === 'completed';
    res.push({
      icon: {
        type: isCompleted ? 'CalendarCheckIcon' : 'CalendarXIcon',
      },
      label: formatCompletionAt(project.completionAt),
    });
  }

  if (project.totalTasks > 0) {
    res.push({
      icon: {
        type: 'ChecklistIcon',
      },
      label: `${project.completedTasks}/${project.totalTasks}`,
    });
  }

  if (project.tags) {
    project.tags.forEach((tag) => {
      res.push({
        icon: {
          type: 'TagIcon',
        },
        label: tag,
      });
    });
  }

  return res;
}
