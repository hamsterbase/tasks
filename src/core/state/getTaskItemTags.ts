import { getParentDisplay } from '@/core/state/getParentDisplay';
import { ITaskModelData } from '@/core/state/type';
import { formatCompletionAt } from '@/core/time/formatCompletionAt';
import { formatDueDateInList } from '@/core/time/formatDueDateInList';
import { formatStartDateInList } from '@/core/time/formatStartDateInList';
import { isPastOrToday } from '@/core/time/isPast';
import { TreeID } from 'loro-crdt';

interface ResultItem {
  icon: {
    type: string;
    props?: Record<string, unknown>;
  };
  label: string;
}

interface TaskItemTagsOptions {
  taskId: TreeID;
  hideProjectTitle?: boolean;
  completionAt?: number;
  status: string;
  startDate?: number;
  dueDate?: number;
  tags?: string[];
}

export function getTaskItemTags(model: ITaskModelData, options: TaskItemTagsOptions): ResultItem[] {
  const { taskId, hideProjectTitle, completionAt, status, startDate, tags, dueDate } = options;
  const res: ResultItem[] = [];

  if (!hideProjectTitle) {
    const parentDisplayData = getParentDisplay(model, taskId);
    if (parentDisplayData) {
      res.push({
        icon:
          parentDisplayData.icon.type === 'area'
            ? {
                type: 'AreaIcon',
              }
            : {
                type: 'ProjectStatusBox',
                props: {
                  progress: parentDisplayData.icon.progress,
                  status: parentDisplayData.icon.status,
                  color: 't3',
                  border: 'border-1',
                },
              },
        label: parentDisplayData.title,
      });
    }
  }

  if (dueDate) {
    res.push({
      icon: {
        type: 'DueIcon',
      },
      label: formatDueDateInList(dueDate),
    });
  }

  if (startDate && !isPastOrToday(startDate)) {
    res.push({
      icon: {
        type: 'CalendarRangeIcon',
      },
      label: formatStartDateInList(startDate),
    });
  }

  if (completionAt && status !== 'created') {
    const isCompleted = status === 'completed';
    res.push({
      icon: {
        type: isCompleted ? 'CalendarCheckIcon' : 'CalendarXIcon',
      },
      label: formatCompletionAt(completionAt),
    });
  }

  if (tags) {
    tags.forEach((tag) => {
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
