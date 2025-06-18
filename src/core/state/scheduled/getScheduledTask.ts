import { ModelTypes } from '@/core/enum';
import { getDateFromUTCTimeStamp } from '@/core/time/getDateFromUTCTimeStamp';
import { TaskObjectSchema } from '@/core/type';
import { localize } from 'vscf/internal/nls';
import {
  addDays,
  differenceInCalendarMonths,
  differenceInDays,
  endOfMonth,
  format,
  isSameMonth,
  isSameYear,
} from 'date-fns';
import { getProject } from '../getProject';
import { getTaskInfo } from '../getTaskInfo';
import { ITaskModelData, ProjectInfoState, TaskInfo } from '../type';

export interface ScheduledGroup {
  key: string;
  title: string;
  subtitle?: string;
  items: (TaskInfo | ProjectInfoState)[];
}

export interface GetScheduledTasksOptions {
  currentDate: number;
  recentModifiedObjectIds?: string[];
  editingContentId?: string;
  language?: string;
}

export interface GetScheduledTasksResult {
  scheduledGroups: ScheduledGroup[];
  willDisappearObjectIds: string[];
}

const formats = {
  'en-US': {
    day: (e: Date) => {
      return format(e, 'd');
    },
    week: (e: Date) => {
      return format(e, 'EEEE');
    },
    month: 'MMMM',
    tomorrow: localize('scheduled.tomorrow', 'Tomorrow'),
    laterYear: 'yyyy',
  },
  'zh-CN': {
    day: (e: Date) => {
      return format(e, 'd') + '日';
    },
    week: (e: Date) => {
      return {
        Mo: '周一',
        Tu: '周二',
        We: '周三',
        Th: '周四',
        Fr: '周五',
        Sa: '周六',
        Su: '周日',
      }[format(e, 'EEEEEE')];
    },
    month: 'M月',
    tomorrow: '明天',
    laterYear: 'yyyy',
  },
} as const;

export function getScheduledTasks(
  modelData: ITaskModelData,
  options: GetScheduledTasksOptions
): GetScheduledTasksResult {
  const timeFormat = formats[(options.language ?? globalThis.language) as keyof typeof formats] ?? formats['en-US'];

  const recentModifiedObjectIds = new Set<string>(options.recentModifiedObjectIds ?? []);
  const willDisappearObjectIds: string[] = [];
  // 过滤出未来的任务
  const scheduledItems: (TaskInfo | ProjectInfoState)[] = modelData.taskList
    .map((task: TaskObjectSchema) => {
      if (task.type === ModelTypes.project) {
        if (!task.startDate || task.startDate < options.currentDate) {
          return null;
        }
        return getProject(modelData, task.id);
      }
      if (task.type === ModelTypes.task) {
        if (!task.startDate || task.startDate < options.currentDate) {
          return null;
        }
        const taskData = getTaskInfo(modelData, task.id);
        if (taskData.isSubTask) {
          return null;
        }
        return taskData;
      }
      return null;
    })
    .filter((o): o is TaskInfo | ProjectInfoState => !!o)
    .filter((o) => {
      if (o.status === 'created') {
        return true;
      }
      if (recentModifiedObjectIds.has(o.id)) {
        if (options.editingContentId !== o.id) {
          willDisappearObjectIds.push(o.id);
        }
        return true;
      }
      return false;
    });

  scheduledItems.sort((a: TaskInfo | ProjectInfoState, b: TaskInfo | ProjectInfoState) => {
    const dateA = a.startDate || 0;
    const dateB = b.startDate || 0;
    return dateA - dateB;
  });

  const groups: ScheduledGroup[] = [];
  const today = getDateFromUTCTimeStamp(options.currentDate);
  const keyItemsMap = new Map<string, (TaskInfo | ProjectInfoState)[]>();

  for (let i = 1; i < 8; i++) {
    const date = addDays(today, i);
    const items: (TaskInfo | ProjectInfoState)[] = [];
    const key = `in7Days-${i}`;
    keyItemsMap.set(key, items);
    groups.push({
      title: timeFormat.day(date),
      key,
      subtitle: i === 1 ? timeFormat.tomorrow : timeFormat.week(date),
      items,
    });
  }

  scheduledItems.forEach((item) => {
    if (!item.startDate) {
      return;
    }
    const date = getDateFromUTCTimeStamp(item.startDate);
    const group = getScheduledTasksGroup(today, date);
    if (keyItemsMap.has(group.key)) {
      keyItemsMap.get(group.key)?.push(item);
    } else {
      const items: (TaskInfo | ProjectInfoState)[] = [item];
      keyItemsMap.set(group.key, items);
      switch (group.group) {
        case GroupType.showMonth: {
          let subtitle = '';
          if (isSameMonth(date, today)) {
            const endDate = addDays(today, 8);
            subtitle = timeFormat.day(endDate) + ' ~ ' + timeFormat.day(endOfMonth(date));
          }
          if (!isSameYear(date, today)) {
            subtitle = format(date, timeFormat.laterYear);
          }
          groups.push({
            title: format(date, timeFormat.month),
            key: group.key,
            subtitle,
            items,
          });
          break;
        }
        case GroupType.later: {
          groups.push({
            title: format(date, timeFormat.laterYear),
            key: group.key,
            subtitle: '',
            items,
          });
          break;
        }
      }
    }
  });

  return {
    scheduledGroups: groups,
    willDisappearObjectIds,
  };
}

const GroupType = {
  in7Days: 0,
  showMonth: 1,
  later: 2,
};

function getScheduledTasksGroup(currentDate: Date, targetDate: Date) {
  const diffDays = differenceInDays(targetDate, currentDate);
  if (diffDays < 8) {
    return {
      key: `in7Days-${diffDays}`,
      group: GroupType.in7Days,
    };
  }
  const diffMonths = differenceInCalendarMonths(targetDate, currentDate);
  if (diffMonths < 6 || isSameYear(currentDate, targetDate)) {
    return {
      key: `showMonth-${diffMonths}`,
      group: GroupType.showMonth,
    };
  }
  return {
    key: `later-${targetDate.getFullYear()}`,
    group: GroupType.later,
  };
}
