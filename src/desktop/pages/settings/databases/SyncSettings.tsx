import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { ICloudService } from '@/services/cloud/common/cloudService.ts';
import React from 'react';
import { ChinaServerSettings } from '@/desktop/pages/settings/databases/components/ChinaServerSettings.tsx';
import { DatabaseList } from '@/desktop/pages/settings/databases/components/DatabaseList.tsx';

export const SyncSettings: React.FC = () => {
  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);

  return (
    <div className="p-6 w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <ChinaServerSettings />
        <DatabaseList />
      </div>
    </div>
  );
};
