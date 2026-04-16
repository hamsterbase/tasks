import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsSection } from '@/desktop/components/Settings/SettingsSection';
import { ChinaServerSettings } from '@/desktop/pages/settings-page/databases/components/ChinaServerSettings.tsx';
import { DatabaseList } from '@/desktop/pages/settings-page/databases/components/DatabaseList.tsx';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService.ts';
import React from 'react';

export const SyncSettings: React.FC = () => {
  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);

  return (
    <SettingsContent title={localize('settings.sync', 'Sync')}>
      <ChinaServerSettings />
      <SettingsSection title={localize('settings.cloud.database', 'Database')}>
        <DatabaseList />
      </SettingsSection>
    </SettingsContent>
  );
};
