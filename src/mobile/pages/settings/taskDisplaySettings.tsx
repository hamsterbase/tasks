import { SettingsIcon } from '@/components/icons';
import { TimeAfterEnum } from '@/core/time/getTimeAfter';
import { useGlobalTaskDisplaySettings } from '@/hooks/useGlobalTaskDisplaySettings';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { PageLayout } from '@/mobile/components/PageLayout';
import React from 'react';

export const TaskDisplaySettings = () => {
  const {
    showFutureTasks,
    showCompletedTasks,
    completedTasksRange,
    setShowFutureTasks,
    setShowCompletedTasks,
    setCompletedTasksRange,
    settingOptions,
  } = useGlobalTaskDisplaySettings();

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'taskDisplaySettings',
        title: settingOptions.title,
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <ListItemGroup
        items={[
          {
            title: settingOptions.showFutureTasks.title,
            description: settingOptions.showFutureTasks.description,
            mode: {
              type: 'switch',
              checked: showFutureTasks,
            },
            onClick: () => setShowFutureTasks(!showFutureTasks),
          },
          {
            title: settingOptions.showCompletedTasks.title,
            description: settingOptions.showCompletedTasks.description,
            mode: {
              type: 'switch',
              checked: showCompletedTasks,
            },
            onClick: () => setShowCompletedTasks(!showCompletedTasks),
          },
        ]}
      />
      <ListItemGroup
        title={settingOptions.completedTasksRange.title}
        items={settingOptions.completedTasksRange.options.map((option) => ({
          title: option.label,
          description: option.description,
          mode: {
            type: 'check',
            checked: completedTasksRange === option.value,
          },
          onClick: () => setCompletedTasksRange(option.value as TimeAfterEnum),
        }))}
      />
    </PageLayout>
  );
};
