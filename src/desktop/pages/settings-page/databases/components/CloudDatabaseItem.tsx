import { CloudIcon, SyncIcon, TrashIcon } from '@/components/icons';
import { DatabaseItem } from '@/desktop/components/DatabaseItem';
import { desktopStyles } from '@/desktop/theme/main';
import { useDatabaseActions } from '@/desktop/hooks/useDatabaseActions';
import { localize } from '@/nls.ts';
import { CloudDatabaseItem as CloudDatabaseType } from '@/services/cloud/common/cloudService.ts';
import { format } from 'date-fns';
import React from 'react';

interface CloudDatabaseItemProps {
  database: CloudDatabaseType;
  isCurrent: boolean;
  mutate: () => Promise<unknown>;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

export const CloudDatabaseItem: React.FC<CloudDatabaseItemProps> = ({ database, isCurrent, mutate }) => {
  const databaseActions = useDatabaseActions(database.databaseId, database, mutate);

  const actionButtons = (
    <>
      <button
        type="button"
        className={desktopStyles.DatabaseItemActionButton}
        title={localize('database.sync', 'Sync')}
        aria-label={localize('database.sync', 'Sync')}
        onClick={databaseActions.handleSync}
      >
        <SyncIcon className={desktopStyles.DatabaseItemActionButtonIcon} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        className={desktopStyles.DatabaseItemActionButtonDanger}
        title={localize('database.delete', 'Delete Database')}
        aria-label={localize('database.delete', 'Delete Database')}
        onClick={() => databaseActions.handleDelete('cloud')}
      >
        <TrashIcon className={desktopStyles.DatabaseItemActionButtonIcon} strokeWidth={1.75} />
      </button>
    </>
  );

  return (
    <DatabaseItem
      icon={<CloudIcon />}
      title={database.databaseName}
      description={`${localize('settings.cloud.online_database', 'Online Database')} · ${format(database.lastModified, 'yyyy/MM/dd HH:mm:ss')} · ${(database.usage / 1024).toFixed(2)} kb`}
      isCurrent={isCurrent}
      onClick={() => databaseActions.handleSwitchToDatabase()}
      actionButtons={actionButtons}
      properties={[
        {
          label: localize('database.databaseSize', 'Database Size'),
          value: formatBytes(database.usage),
        },
        {
          label: localize('database.lastUpdated', 'Last Updated'),
          value: format(database.lastModified, 'yyyy/MM/dd HH:mm'),
        },
      ]}
    />
  );
};
