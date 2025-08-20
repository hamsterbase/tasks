import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsTitle } from '@/desktop/components/Settings/SettingsTitle';
import { ChinaServerSettings } from '@/desktop/pages/settings/databases/components/ChinaServerSettings.tsx';
import { DatabaseList } from '@/desktop/pages/settings/databases/components/DatabaseList.tsx';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService.ts';
import React from 'react';

export const SyncSettings: React.FC = () => {
  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);

  return (
    <SettingsContent>
      <SettingsTitle title={localize('settings.sync', 'Sync')} />
      <ChinaServerSettings />
      <DatabaseList />
    </SettingsContent>
  );
};
