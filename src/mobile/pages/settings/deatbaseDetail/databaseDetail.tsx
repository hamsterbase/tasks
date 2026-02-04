import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { DeviceDatabaseItem, ICloudService } from '@/services/cloud/common/cloudService';
import React from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import { SettingsIcon } from '../../../../components/icons';
import { localize } from '../../../../nls';
import { PageLayout } from '../../../components/PageLayout';
import { CloudDatabaseContent } from './CloudDatabaseContent';
import { LocalDatabaseContent } from './LocalDatabaseContent';
import { OfflineDatabaseContent } from './OfflineDatabaseContent';
import { useDatabaseActions } from './useDatabaseActions';

export const DatabaseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);

  const {
    data: database,
    isLoading,
    mutate,
  } = useSWR(['database-detail', id], async () => {
    if (!id) return null;
    const databases = await cloudService.listDatabases();
    return databases.find((db) => db.databaseId === id) || null;
  });

  const databaseActions = useDatabaseActions(id, database || null, mutate);
  const renderDatabaseContent = () => {
    if (isLoading) {
      return <div className="text-center p-4">{localize('common.loading', 'Loading...')}</div>;
    }

    if (!database) {
      return <div className="text-center p-4">{localize('database.notFound', 'Database not found')}</div>;
    }

    switch (database.type) {
      case 'cloud':
        return (
          <CloudDatabaseContent
            database={database as DeviceDatabaseItem & { type: 'cloud' }}
            actions={databaseActions}
          />
        );
      case 'local':
        return (
          <LocalDatabaseContent
            database={database as DeviceDatabaseItem & { type: 'local' }}
            actions={databaseActions}
          />
        );
      case 'offline':
        return (
          <OfflineDatabaseContent
            database={database as DeviceDatabaseItem & { type: 'offline' }}
            actions={databaseActions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'databaseDetail',
        title: localize('settings.database.detail', 'Database Details'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      {renderDatabaseContent()}
    </PageLayout>
  );
};
