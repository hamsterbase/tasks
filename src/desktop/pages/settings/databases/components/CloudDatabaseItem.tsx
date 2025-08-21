import { CloudIcon } from '@/components/icons';
import { DatabaseItem } from '@/desktop/components/DatabaseItem';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';
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
      <SettingButton
        onClick={() => databaseActions.handleDelete('cloud')}
        variant="text"
        color="danger"
        size="small"
        inline
      >
        {localize('database.delete', 'Delete Database')}
      </SettingButton>

      <SettingButton onClick={databaseActions.handleSync} variant="solid" color="primary" size="small">
        {localize('database.sync', 'Sync')}
      </SettingButton>
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
