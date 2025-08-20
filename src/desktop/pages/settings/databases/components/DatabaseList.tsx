import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsTitle } from '@/desktop/components/Settings/SettingsTitle';
import { useCreateDatabaseOverlay } from '@/desktop/overlay/createDatabase/useCreateDatabaseOverlay.ts';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { localize } from '@/nls.ts';
import { DeviceDatabaseItem, ICloudService } from '@/services/cloud/common/cloudService.ts';
import React from 'react';
import useSWR from 'swr';
import { CloudDatabaseItem } from './CloudDatabaseItem';
import { LocalDatabaseItem } from './LocalDatabaseItem';
import { OfflineDatabaseItem } from './OfflineDatabaseItem';

export const DatabaseList: React.FC = () => {
  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);
  const createDatabaseOverlay = useCreateDatabaseOverlay();
  const isLoggedIn = cloudService.config.type === 'login';

  const {
    data: databases,
    error,
    isLoading,
    mutate,
  } = useSWR(
    'database-list',
    async () => {
      return cloudService.listDatabases();
    },
    {
      revalidateOnFocus: true,
    }
  );

  const cloudDatabasesCount = databases?.filter((db) => db.type === 'cloud').length || 0;

  const renderDatabaseItem = (database: DeviceDatabaseItem) => {
    const isCurrent = database.databaseId === cloudService.databaseConfig;

    switch (database.type) {
      case 'cloud':
        return <CloudDatabaseItem isCurrent={isCurrent} mutate={mutate} database={database} />;
      case 'local':
        return <LocalDatabaseItem isCurrent={isCurrent} mutate={mutate} database={database} />;
      case 'offline':
        return <OfflineDatabaseItem isCurrent={isCurrent} mutate={mutate} database={database} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg2 rounded-lg p-4">
        <h3 className="text-lg font-medium text-t1 mb-4">{localize('settings.cloud.database', 'Database')}</h3>
        <div className="text-center py-4">
          <span className="text-t2">{localize('common.loading', 'Loading...')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg2 rounded-lg p-4">
        <h3 className="text-lg font-medium text-t1 mb-4">{localize('settings.cloud.database', 'Database')}</h3>
        <div className="text-center py-4">
          <span className="text-red-500">{localize('settings.cloud.error', 'Failed to load databases')}</span>
        </div>
      </div>
    );
  }

  if (!databases || databases.length === 0) {
    return (
      <div className="bg-bg2 rounded-lg p-4">
        <h3 className="text-lg font-medium text-t1 mb-4">{localize('settings.cloud.database', 'Database')}</h3>
        <div className="text-center py-4">
          <span className="text-t2">{localize('settings.sync.noDatabases', 'No databases available')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <SettingsTitle
        title={localize('settings.cloud.database', 'Database')}
        level={2}
        action={
          (isLoggedIn && cloudDatabasesCount < 3) || (
            <button
              className="px-3 py-1.5 text-sm font-medium text-white bg-brand border border-brand rounded hover:bg-brand-hover focus:outline-none transition-colors"
              onClick={() => createDatabaseOverlay({ onSuccess: () => mutate() })}
            >
              {localize('settings.createDatabase.title', 'Create Cloud Database')}
            </button>
          )
        }
      />
      <ItemGroup>
        {databases.map((database) => (
          <div key={database.databaseId} className="w-full">
            {renderDatabaseItem(database)}
          </div>
        ))}
      </ItemGroup>
    </div>
  );
};
