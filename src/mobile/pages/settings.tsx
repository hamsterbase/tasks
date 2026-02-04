import { getTheme } from '@/base/browser/initializeTheme';
import { taskDisplaySettingOptions } from '@/base/common/TaskDisplaySettings';
import { SettingsIcon } from '@/components/icons';
import { useAbout } from '@/hooks/use-about';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import useNavigate from '@/hooks/useNavigate';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import { selfhostedSyncPageTitle } from '@/services/selfhostedSync/browser/useAddSelfhostedServer';
import { ISwitchService } from '@/services/switchService/common/switchService';
import React from 'react';
import { ListItemGroup } from '../components/listItem/listItem';
import { PageLayout } from '../components/PageLayout';

export const MobileSettings = () => {
  const navigate = useNavigate();
  const cloudService = useService(ICloudService);
  const { showAbout } = useAbout();
  const switchService = useService(ISwitchService);
  useWatchEvent(cloudService.onSessionChange);

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'settings',
        title: localize('settings.title', 'Settings'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <ListItemGroup
        items={[
          {
            title: localize('settings.language', 'Language'),
            onClick: () => navigate({ path: '/settings/language' }),
            mode: {
              type: 'navigation',
            },
          },
          {
            title: localize('settings.theme', 'Theme'),
            onClick: () => navigate({ path: '/settings/theme' }),
            mode: {
              type: 'navigation',
            },
          },
          {
            title: taskDisplaySettingOptions.title,
            onClick: () => navigate({ path: '/settings/task-display' }),
            mode: {
              type: 'navigation',
            },
          },
          {
            title: localize('settings.export', 'Export'),
            onClick: () => navigate({ path: '/settings/export' }),
            mode: {
              type: 'navigation',
            },
          },
          {
            title: localize('settings.import', 'Import'),
            onClick: () => navigate({ path: '/settings/import' }),
            mode: {
              type: 'navigation',
            },
          },
          {
            title: localize('settings.cloud', 'Cloud'),
            onClick: () => navigate({ path: '/settings/cloud' }),
            mode: {
              type: 'navigation',
            },
          },
          {
            title: selfhostedSyncPageTitle,
            onClick: () => navigate({ path: '/settings/selfhosted-sync' }),
            mode: {
              type: 'navigation',
            },
          },
          {
            hidden: switchService.getLocalSwitch('showNativeAboutButton'),
            title: localize('settings.about', 'About'),
            onClick: () => navigate({ path: '/settings/about' }),
            mode: {
              type: 'navigation',
            },
          },
          {
            hidden: !switchService.getLocalSwitch('showNativeAboutButton'),
            title: localize('settings.about', 'About'),
            onClick: () => showAbout({ showICP: globalThis.language === 'zh-CN', displayMode: getTheme() }),
            mode: {
              type: 'navigation',
            },
          },
        ]}
      />
    </PageLayout>
  );
};
