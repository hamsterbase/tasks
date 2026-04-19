import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { useCreateDatabaseOverlay } from '@/desktop/overlay/createDatabase/useCreateDatabaseOverlay.ts';
import { desktopStyles } from '@/desktop/theme/main';
import { PlusIcon } from '@/components/icons';
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
  const databaseCountLabel =
    globalThis.language === 'zh-CN' ? `${databases?.length ?? 0} 个数据库` : `${databases?.length ?? 0} databases`;

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
      <ItemGroup>
        <div className={desktopStyles.DatabaseListStateContainer}>
          <span className={desktopStyles.DatabaseListStateText}>{localize('common.loading', 'Loading...')}</span>
        </div>
      </ItemGroup>
    );
  }

  if (error) {
    return (
      <ItemGroup>
        <div className={desktopStyles.DatabaseListStateContainer}>
          <span className={desktopStyles.DatabaseListErrorText}>
            {localize('settings.cloud.error', 'Failed to load databases')}
          </span>
        </div>
      </ItemGroup>
    );
  }

  if (!databases || databases.length === 0) {
    return (
      <ItemGroup>
        <div className={desktopStyles.DatabaseListStateContainer}>
          <span className={desktopStyles.DatabaseListStateText}>
            {localize('settings.sync.noDatabases', 'No databases available')}
          </span>
        </div>
      </ItemGroup>
    );
  }

  return (
    <ItemGroup>
      <div className={desktopStyles.SettingsItemContainer}>
        <span className={desktopStyles.SettingsItemTitle}>{databaseCountLabel}</span>
        {isLoggedIn && cloudDatabasesCount < 3 && (
          <button
            type="button"
            className={desktopStyles.DatabaseItemActionButton}
            title={localize('settings.createDatabase.title', 'Create Cloud Database')}
            aria-label={localize('settings.createDatabase.title', 'Create Cloud Database')}
            onClick={() => createDatabaseOverlay({ onSuccess: () => mutate() })}
          >
            <PlusIcon className={desktopStyles.DatabaseItemActionButtonIcon} strokeWidth={1.75} />
          </button>
        )}
      </div>
      {databases.map((database) => renderDatabaseItem(database))}
    </ItemGroup>
  );
};
