import {
  AIIcon,
  BackIcon,
  CloudIcon,
  DownloadIcon,
  PaletteIcon,
  SelfHostedSyncIcon,
  UserIcon,
} from '@/components/icons';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import classNames from 'classnames';
import React from 'react';
import { Link, useLocation } from 'react-router';
import { desktopStyles } from '../../theme/main.ts';
import { MacTopBar } from '../MacTopBar.tsx';

const groups = [
  {
    id: 'general',
    heading: localize('settings.sidebar.general', 'General'),
    items: [
      {
        id: 'appearance',
        label: localize('settings.appearance', 'Appearance'),
        path: '/desktop/settings/appearance',
        icon: PaletteIcon,
      },
      {
        id: 'ai',
        label: localize('settings.ai', 'AI Assistant'),
        path: '/desktop/settings/ai',
        icon: AIIcon,
      },
    ],
  },
  {
    id: 'data',
    heading: localize('settings.sidebar.data', 'Data'),
    items: [
      {
        id: 'sync',
        label: localize('settings.sync', 'Sync'),
        path: '/desktop/settings/sync',
        icon: CloudIcon,
      },
      {
        id: 'selfhosted-sync',
        label: localize('sync.selfHostedSync', 'Selfhosted Sync'),
        path: '/desktop/settings/selfhosted-sync',
        icon: SelfHostedSyncIcon,
      },
      {
        id: 'import-export',
        label: localize('settings.import_export', 'Import & Export'),
        path: '/desktop/settings/import-export',
        icon: DownloadIcon,
      },
    ],
  },
  {
    id: 'account',
    heading: localize('settings.sidebar.account', 'Account'),
    items: [
      {
        id: 'account',
        label: localize('account.title', 'Account'),
        path: '/desktop/settings/account',
        icon: UserIcon,
      },
    ],
  },
] as const;

export const SettingsSidebarContent: React.FC = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const location = useLocation();

  return (
    <div className={classNames(desktopStyles.sidebarBackground, desktopStyles.sidebarContainerStyle)}>
      <MacTopBar />
      <div className={desktopStyles.SettingsSidebarBackRow}>
        <Link to="/desktop" className={desktopStyles.SettingsSidebarBackLink}>
          <span className={desktopStyles.SettingsSidebarBackIconContainer}>
            <BackIcon className={desktopStyles.SettingsSidebarBackIcon} strokeWidth={1.5} />
          </span>
          <span className={desktopStyles.SettingsSidebarBackLabel}>
            {localize('settings.back_to_app', 'Back to App')}
          </span>
        </Link>
      </div>
      <div className={desktopStyles.SettingsSidebarGroupList}>
        {groups.map((group) => (
          <div key={group.id} className={desktopStyles.SettingsSidebarGroup}>
            <span className={desktopStyles.SettingsSidebarGroupHeading}>{group.heading}</span>
            {group.items.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.id === 'account' && location.pathname.startsWith('/desktop/settings/account'));
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={classNames(
                    desktopStyles.SidebarMenuItem,
                    isActive ? desktopStyles.SidebarMenuItemActive : desktopStyles.SidebarMenuItemInactive
                  )}
                >
                  <span className={desktopStyles.SidebarMenuItemIcon}>
                    <Icon className={desktopStyles.SidebarMenuItemIconSvg} strokeWidth={1.5} />
                  </span>
                  <span className={desktopStyles.SidebarMenuItemLabel}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
