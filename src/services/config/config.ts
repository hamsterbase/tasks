import { TimeAfterEnum } from '@/core/time/getTimeAfter';
import { ConfigKey } from './configService.ts';

export function showFutureTasksConfigKey(page: string): ConfigKey<boolean> {
  return {
    key: `showFutureTasks-${page}`,
    default: false,
    check: (value: boolean) => typeof value === 'boolean',
  };
}

export function showCompletedTasksConfigKey(page: string): ConfigKey<boolean> {
  return {
    key: `showCompletedTasks-${page}`,
    default: false,
    check: (value: boolean) => typeof value === 'boolean',
  };
}

export function completedTasksRangeConfigKey(page: string): ConfigKey<TimeAfterEnum> {
  return {
    key: `completedTasksRange-${page}`,
    default: 'all',
    check: (value: TimeAfterEnum) =>
      typeof value === 'string' && ['today', 'day', 'week', 'month', 'all'].includes(value),
  };
}

export function toggleAreaConfigKey(): ConfigKey<string[]> {
  return {
    key: `area-toggle-state`,
    default: [],
    check: (value: string[]) => {
      return Array.isArray(value) && value.every((item) => typeof item === 'string');
    },
  };
}

export function chinaServerConfigKey(): ConfigKey<boolean> {
  return {
    key: 'chinaServer',
    default: false,
    check: (value: boolean) => typeof value === 'boolean',
  };
}
