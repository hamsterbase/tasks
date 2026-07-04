import { SettingsIcon } from '@/components/icons';
import { TimeAfterEnum } from '@/core/time/getTimeAfter';
import { useConfig } from '@/hooks/useConfig';
import { useGlobalTaskDisplaySettings } from '@/hooks/useGlobalTaskDisplaySettings';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { PageLayout } from '@/mobile/components/PageLayout';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { groupTodayByAreaProjectConfigKey } from '@/services/config/config';
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

  const { value: groupTodayByAreaProject, setValue: setGroupTodayByAreaProject } = useConfig(
    groupTodayByAreaProjectConfigKey()
  );

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'taskDisplaySettings',
        title: settingOptions.title,
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <div className={styles.settingsPageSections}>
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
          title={localize('settings.today', 'Today')}
          items={[
            {
              title: localize('settings.today.group_by_area_project', 'Group by Area / Project'),
              description: localize(
                'settings.today.group_by_area_project.description',
                'Group projects by area and tasks by project on the Today page.'
              ),
              mode: {
                type: 'switch',
                checked: groupTodayByAreaProject,
              },
              onClick: () => setGroupTodayByAreaProject(!groupTodayByAreaProject),
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
      </div>
    </PageLayout>
  );
};
