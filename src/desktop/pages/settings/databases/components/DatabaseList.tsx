import { SettingButton } from '@/desktop/components/Settings/Button/Button';
import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsTitle } from '@/desktop/components/Settings/SettingsTitle';
import { useCreateDatabaseOverlay } from '@/desktop/overlay/createDatabase/useCreateDatabaseOverlay.ts';
import { desktopStyles } from '@/desktop/theme/main';
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
        return (
          <CloudDatabaseItem key={database.databaseId} isCurrent={isCurrent} mutate={mutate} database={database} />
        );
      case 'local':
        return (
          <LocalDatabaseItem key={database.databaseId} isCurrent={isCurrent} mutate={mutate} database={database} />
        );
      case 'offline':
        return (
          <OfflineDatabaseItem key={database.databaseId} isCurrent={isCurrent} mutate={mutate} database={database} />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={desktopStyles.DatabaseListContainer}>
        <SettingsTitle title={localize('settings.cloud.database', 'Database')} level={2} />
        <ItemGroup>
          <div className={desktopStyles.DatabaseListLoadingContainer}>
            <span className={desktopStyles.DatabaseListLoadingText}>{localize('common.loading', 'Loading...')}</span>
          </div>
        </ItemGroup>
      </div>
    );
  }

  if (error) {
    return (
      <div className={desktopStyles.DatabaseListContainer}>
        <SettingsTitle title={localize('settings.cloud.database', 'Database')} level={2} />
        <ItemGroup>
          <div className={desktopStyles.DatabaseListErrorContainer}>
            <span className={desktopStyles.DatabaseListErrorText}>
              {localize('settings.cloud.error', 'Failed to load databases')}
            </span>
          </div>
        </ItemGroup>
      </div>
    );
  }

  if (!databases || databases.length === 0) {
    return (
      <div className={desktopStyles.DatabaseListContainer}>
        <SettingsTitle title={localize('settings.cloud.database', 'Database')} level={2} />
        <ItemGroup>
          <div className={desktopStyles.DatabaseListEmptyContainer}>
            <span className={desktopStyles.DatabaseListEmptyText}>
              {localize('settings.sync.noDatabases', 'No databases available')}
            </span>
          </div>
        </ItemGroup>
      </div>
    );
  }

  return (
    <div className={desktopStyles.DatabaseListContainer}>
      <SettingsTitle
        title={localize('settings.cloud.database', 'Database')}
        level={2}
        action={
          isLoggedIn &&
          cloudDatabasesCount < 3 && (
            <SettingButton
              variant="solid"
              color="primary"
              size="small"
              onClick={() => createDatabaseOverlay({ onSuccess: () => mutate() })}
            >
              {localize('settings.createDatabase.title', 'Create Cloud Database')}
            </SettingButton>
          )
        }
      />
      <ItemGroup>{databases.map((database) => renderDatabaseItem(database))}</ItemGroup>
    </div>
  );
};
