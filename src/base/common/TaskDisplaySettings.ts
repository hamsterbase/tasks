import { localize } from '@/nls';

export const taskDisplaySettingOptions = {
  title: localize('settings.displaySettings', 'Default Display Settings for Tasks'),
  description: localize(
    'settings.displaySettings.description',
    'Control which tasks are visible across all views (Today, Projects, Areas). These settings apply everywhere unless overridden in specific views.'
  ),
  showFutureTasks: {
    title: localize('settings.showFutureTasks', 'Show Future Tasks'),
    description: localize('settings.showFutureTasks.description', 'Display tasks with future due dates in all views.'),
  },
  showCompletedTasks: {
    title: localize('settings.showCompletedTasks', 'Show Completed Tasks'),
    description: localize('settings.showCompletedTasks.description', 'Display finished tasks in all views.'),
  },
  completedTasksRange: {
    title: localize('settings.completedTasksRange', 'Completed Tasks Range'),
    description: localize(
      'settings.completedTasksRange.description',
      'How long to keep completed tasks visible across all views.'
    ),
    options: [
      {
        value: 'today',
        description: localize(
          'settings.completedTasksRange.today.description',
          'Show tasks completed since start of today'
        ),
        label: localize('settings.completedTasksRange.today', 'Today'),
      },
      {
        value: 'day',
        description: localize(
          'settings.completedTasksRange.day.description',
          'Show tasks completed since start of yesterday'
        ),
        label: localize('settings.completedTasksRange.day', 'Last 24 hours'),
      },
      {
        value: 'week',
        description: localize(
          'settings.completedTasksRange.week.description',
          'Show tasks completed since start of last week'
        ),
        label: localize('settings.completedTasksRange.week', 'Last week'),
      },
      {
        value: 'month',
        description: localize(
          'settings.completedTasksRange.month.description',
          'Show tasks completed since start of last month'
        ),
        label: localize('settings.completedTasksRange.month', 'Last month'),
      },
      {
        value: 'all',
        description: localize('settings.completedTasksRange.all.description', 'Show all completed tasks'),
        label: localize('settings.completedTasksRange.all', 'All time'),
      },
    ],
  },
} as const;
