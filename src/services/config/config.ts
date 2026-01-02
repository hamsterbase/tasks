import { TimeAfterEnum } from '@/core/time/getTimeAfter';
import { ISelfhostedSyncServerConfig } from '../selfhostedSync/common/selfhostedSyncService.ts';
import { ConfigKey } from './configService.ts';

export function showFutureTasksConfigKey(page: string, defaultValue?: boolean): ConfigKey<boolean> {
  return {
    key: `showFutureTasks-${page}`,
    default: defaultValue ?? false,
    check: (value: boolean) => typeof value === 'boolean',
  };
}

export function showCompletedTasksConfigKey(page: string, defaultValue?: boolean): ConfigKey<boolean> {
  return {
    key: `showCompletedTasks-${page}`,
    default: defaultValue ?? false,
    check: (value: boolean) => typeof value === 'boolean',
  };
}

export function completedTasksRangeConfigKey(page: string, defaultValue?: TimeAfterEnum): ConfigKey<TimeAfterEnum> {
  return {
    key: `completedTasksRange-${page}`,
    default: defaultValue ?? 'all',
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

export function mainSidebarWidthConfigKey(): ConfigKey<number[]> {
  return {
    key: 'mainSidebarWidth',
    default: [],
    check: (value: number[]) =>
      Array.isArray(value) && value.length === 2 && value.every((item) => typeof item === 'number'),
  };
}

export function detailPanelConfigKey(): ConfigKey<number[]> {
  return {
    key: 'detailPanel',
    default: [],
    check: (value: number[]) =>
      Array.isArray(value) && value.length === 2 && value.every((item) => typeof item === 'number'),
  };
}

export function notesMarkdownRenderConfigKey(): ConfigKey<boolean> {
  return {
    key: 'notesMarkdownRender',
    default: true,
    check: (value: boolean) => typeof value === 'boolean',
  };
}

export function thirdpartySyncServersConfigKey(): ConfigKey<ISelfhostedSyncServerConfig | null> {
  return {
    key: 'thirdpartySyncServers',
    default: null,
    check: (value: ISelfhostedSyncServerConfig | null) => {
      if (value === null) return true;
      return typeof value === 'object' && typeof value.id === 'string';
    },
  };
}

export type DockBadgeCountType = 'none' | 'overdue' | 'overdue_and_today' | 'overdue_today_and_inbox';

export function dockBadgeCountTypeConfigKey(): ConfigKey<DockBadgeCountType> {
  return {
    key: 'dockBadgeCountType',
    default: 'overdue_and_today',
    check: (value: DockBadgeCountType) =>
      typeof value === 'string' && ['none', 'overdue', 'overdue_and_today', 'overdue_today_and_inbox'].includes(value),
  };
}
