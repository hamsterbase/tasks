import { CloudIcon } from '@/components/icons';
import { DatabaseItem } from '@/desktop/components/DatabaseItem';
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
      {!databaseActions.isSwitchNeeded && (
        <button
          onClick={databaseActions.handleSync}
          className="px-3 py-1.5 text-sm bg-brand text-white rounded hover:bg-brand/80"
        >
          {localize('database.sync', 'Sync')}
        </button>
      )}

      {databaseActions.isSwitchNeeded && (
        <button
          onClick={databaseActions.handleSwitchToDatabase}
          className="px-3 py-1.5 text-sm bg-brand text-white rounded hover:bg-brand/80"
        >
          {localize('database.switch.to', 'Switch to Database')}
        </button>
      )}

      <button
        onClick={() => databaseActions.handleDelete('cloud')}
        className="px-3 py-1.5 text-sm bg-stress-red text-white rounded hover:bg-stress-red/80"
      >
        {localize('database.delete', 'Delete Database')}
      </button>
    </>
  );

  return (
    <DatabaseItem
      icon={<CloudIcon className="w-5 h-5 text-brand" />}
      title={database.databaseName}
      description={`${new Date(database.lastModified).toLocaleDateString()} · ${(database.usage / 1024).toFixed(2)} kb`}
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
          value: format(database.lastModified, 'yyyy/MM/dd HH:mm:ss'),
        },
      ]}
    />
  );
};
