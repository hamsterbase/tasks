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
import { DragHandle } from '../DragHandle.tsx';
import { useShouldShowOnDesktopMac } from '@/desktop/hooks/useShouldShowOnDesktopMac.ts';

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
  const sidebarContainerNoPaddingTop = useShouldShowOnDesktopMac();
  const location = useLocation();

  return (
    <div className={classNames(desktopStyles.sidebarBackground, desktopStyles.sidebarContainerStyle)}>
      {sidebarContainerNoPaddingTop && (
        <div className={desktopStyles.SidebarHeaderContainer}>
          <DragHandle />
        </div>
      )}
      <div className="mb-3 flex h-12 flex-shrink-0 items-center pl-5 pr-2">
        <Link
          to="/desktop"
          className="-mx-2 flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-t2 transition-colors hover:bg-bg3 hover:text-t1"
        >
          <span className="flex size-3.5 items-center justify-center">
            <BackIcon className="size-3.5" strokeWidth={1.5} />
          </span>
          <span>{localize('settings.back_to_app', 'Back to App')}</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col gap-0.5">
            <span className="px-2 pb-1.5 pt-3 text-xs font-semibold tracking-wider text-t3">{group.heading}</span>
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
                    'flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors',
                    isActive ? 'bg-bg3 font-medium text-t2' : 'text-t2 hover:bg-bg3 hover:text-t1'
                  )}
                >
                  <span className="flex size-4 flex-shrink-0 items-center justify-center text-t3">
                    <Icon className="size-4" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
