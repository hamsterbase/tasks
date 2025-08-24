import { CloudIcon, PaletteIcon, SettingsIcon, UserIcon } from '@/components/icons';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import classNames from 'classnames';
import React from 'react';
import { desktopStyles } from '../../theme/main.ts';
import { BackButton } from '../BackButton/BackButton.tsx';
import { DragHandle } from '../DragHandle.tsx';
import { MenuItem } from '../MenuItem/MenuItem.tsx';
import { useShouldShowOnDesktopMac } from '@/desktop/hooks/useShouldShowOnDesktopMac.ts';

const tabs = [
  {
    id: 'account',
    label: localize('account.title', 'Account'),
    path: '/desktop/settings/account',
    icon: <UserIcon />,
  },
  {
    id: 'appearance',
    label: localize('settings.appearance', 'Appearance'),
    path: '/desktop/settings/appearance',
    icon: <PaletteIcon />,
  },
  {
    id: 'import-export',
    label: localize('settings.import_export', 'Import & Export'),
    path: '/desktop/settings/import-export',
    icon: <SettingsIcon />,
  },
  {
    id: 'sync',
    label: localize('settings.sync', 'Sync'),
    path: '/desktop/settings/sync',
    icon: <CloudIcon />,
  },
];

export const SettingsSidebarContent: React.FC = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const sidebarContainerNoPaddingTop = useShouldShowOnDesktopMac();

  return (
    <div
      className={classNames(desktopStyles.sidebarBackground, desktopStyles.sidebarContainerStyle, {
        [desktopStyles.sidebarContainerNoPaddingTop]: sidebarContainerNoPaddingTop,
      })}
    >
      <DragHandle></DragHandle>
      <BackButton label={localize('settings.back_to_app', 'Back to App')} to="/desktop" />
      <ul className={classNames(desktopStyles.SidebarMenuItemContainer, 'flex-1')}>
        {tabs.map((tab) => (
          <MenuItem key={tab.id} to={tab.path} text={tab.label} icon={tab.icon} />
        ))}
      </ul>
    </div>
  );
};
