import { TimeAfterEnum } from '@/core/time/getTimeAfter';
import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsItem } from '@/desktop/components/Settings/SettingsItem';
import { SettingsTitle } from '@/desktop/components/Settings/SettingsTitle';
import { Space } from '@/desktop/components/Space/Space';
import { useConfig } from '@/hooks/useConfig';
import { useGlobalTaskDisplaySettings } from '@/hooks/useGlobalTaskDisplaySettings';
import { localize } from '@/nls';
import {
  dockBadgeCountTypeConfigKey,
  notesMarkdownRenderConfigKey,
  type DockBadgeCountType,
} from '@/services/config/config';
import React, { useState } from 'react';

export const AppearanceSettings: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
  const [currentLanguage] = useState(globalThis.language || 'en-US');
  const {
    showFutureTasks,
    showCompletedTasks,
    completedTasksRange,
    setShowFutureTasks,
    setShowCompletedTasks,
    setCompletedTasksRange,
    settingOptions,
  } = useGlobalTaskDisplaySettings();

  const { value: notesMarkdownRender, setValue: setNotesMarkdownRender } = useConfig(notesMarkdownRenderConfigKey());
  const { value: dockBadgeCountType, setValue: setDockBadgeCountType } = useConfig(dockBadgeCountTypeConfigKey());

  const changeTheme = (theme: string) => {
    localStorage.setItem('theme', theme);
    setCurrentTheme(theme);
    window.location.reload();
  };

  const changeLanguage = (lang: string) => {
    localStorage.setItem('language', lang);
    window.location.reload();
  };

  const getLanguageValue = (locale: string) => {
    switch (locale) {
      case 'en-US':
        return 'en';
      case 'zh-CN':
        return 'zh';
      default:
        return 'en';
    }
  };

  return (
    <SettingsContent>
      <SettingsTitle title={localize('settings.appearance', 'Appearance')} />
      <ItemGroup>
        <SettingsItem
          title={localize('settings.theme', 'Theme')}
          description={localize('settings.theme.description', 'Select your preferred theme.')}
          action={{
            type: 'select',
            options: [
              { value: 'light', label: localize('settings.theme.light', 'Light') },
              { value: 'dark', label: localize('settings.theme.dark', 'Dark') },
              { value: 'eink', label: localize('settings.theme.eink', 'E-Ink') },
              { value: 'auto', label: localize('settings.theme.auto', 'Auto (System)') },
            ],
            currentValue: currentTheme,
            onChange: changeTheme,
          }}
        />
        <SettingsItem
          title={localize('settings.language', 'Language')}
          description={localize('settings.language.description', 'Select your preferred language.')}
          action={{
            type: 'select',
            options: [
              { value: 'en', label: localize('settings.language.english', 'English') },
              { value: 'zh', label: '简体中文' },
            ],
            currentValue: getLanguageValue(currentLanguage),
            onChange: changeLanguage,
          }}
        />
      </ItemGroup>
      <Space size="large"></Space>
      <SettingsTitle title={localize('settings.notes', 'Notes')} />
      <ItemGroup>
        <SettingsItem
          title={localize('settings.render_markdown', 'Render Markdown')}
          description={localize(
            'settings.render_markdown.description',
            'Render notes as markdown in task and project details.'
          )}
          action={{
            type: 'switch',
            currentValue: notesMarkdownRender,
            onChange: () => {
              setNotesMarkdownRender(!notesMarkdownRender);
            },
          }}
        ></SettingsItem>
      </ItemGroup>
      <Space size="large"></Space>
      <SettingsTitle title={localize('settings.dock_badge', 'Dock Badge')} />
      <ItemGroup>
        <SettingsItem
          title={localize('settings.dock_badge.count_type', 'Badge Count Type')}
          action={{
            type: 'select',
            options: [
              { value: 'none', label: localize('settings.dock_badge.count_type.none', 'None') },
              { value: 'overdue', label: localize('settings.dock_badge.count_type.overdue', 'Overdue') },
              {
                value: 'overdue_and_today',
                label: localize('settings.dock_badge.count_type.overdue_and_today', 'Overdue + Today'),
              },
              {
                value: 'overdue_today_and_inbox',
                label: localize('settings.dock_badge.count_type.overdue_today_and_inbox', 'Overdue + Today + Inbox'),
              },
            ],
            currentValue: dockBadgeCountType,
            onChange: (value: string) => setDockBadgeCountType(value as DockBadgeCountType),
          }}
        />
      </ItemGroup>
      <Space size="large"></Space>
      <SettingsTitle title={settingOptions.title} description={settingOptions.description} level={2} />
      <ItemGroup>
        <SettingsItem
          title={settingOptions.showFutureTasks.title}
          description={settingOptions.showFutureTasks.description}
          action={{
            type: 'switch',
            currentValue: showFutureTasks,
            onChange: setShowFutureTasks,
          }}
        />
        <SettingsItem
          title={settingOptions.showCompletedTasks.title}
          description={settingOptions.showCompletedTasks.description}
          action={{
            type: 'switch',
            currentValue: showCompletedTasks,
            onChange: setShowCompletedTasks,
          }}
        />
        <SettingsItem
          title={settingOptions.completedTasksRange.title}
          description={settingOptions.completedTasksRange.description}
          action={{
            type: 'select',
            options: [...settingOptions.completedTasksRange.options],
            currentValue: completedTasksRange,
            onChange: (value: string) => setCompletedTasksRange(value as TimeAfterEnum),
          }}
        />
      </ItemGroup>
    </SettingsContent>
  );
};
