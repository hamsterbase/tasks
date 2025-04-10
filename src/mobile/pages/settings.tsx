import { HomeIcon, SettingsIcon } from '@/components/icons';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import useNavigate from '@/hooks/useNavigate';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import React from 'react';
import { ListItemGroup } from '../components/listItem/listItem';
import { PageLayout } from '../components/PageLayout';
import { useAbout } from '@/hooks/use-about';
import { ISwitchService } from '@/services/switchService/common/switchService';
import { getTheme } from '@/base/browser/initializeTheme';

export const MobileSettings = () => {
  const navigate = useNavigate();
  const cloudService = useService(ICloudService);
  const { showAbout } = useAbout();
  const switchService = useService(ISwitchService);
  useWatchEvent(cloudService.onSessionChange);

  return (
    <PageLayout
      header={{
        id: 'settings',
        title: localize('settings.title', 'Settings'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
      bottomMenu={{
        left: {
          icon: <HomeIcon className="w-6 h-6" />,
          status: 'inactive',
          onClick: () => {
            navigate({ path: '/', replace: true });
          },
        },
        mid: {
          onClick: () => {
            navigate({ path: '/create_task' });
          },
        },
        right: {
          icon: <SettingsIcon className="w-6 h-6" />,
          status: 'active',
        },
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
