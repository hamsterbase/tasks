import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { localize } from '@/nls';
import { DeviceDatabaseItem } from '@/services/cloud/common/cloudService';
import { format } from 'date-fns';
import React from 'react';
import { useDatabaseActions } from './useDatabaseActions';

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

export const CloudDatabaseContent = ({
  database,
  actions,
}: {
  database: DeviceDatabaseItem & { type: 'cloud' };
  actions: ReturnType<typeof useDatabaseActions>;
}) => (
  <>
    <ListItemGroup
      items={[
        {
          title: localize('database.databaseName', 'Database Name'),
          mode: {
            type: 'label',
            label: database.databaseName,
          },
        },

        {
          title: localize('database.databaseSize', 'Database Size'),
          mode: {
            type: 'label',
            label: formatBytes(database.usage),
          },
        },
        {
          title: localize('database.lastUpdated', 'Last Updated'),
          mode: {
            type: 'label',
            label: format(database.lastModified, 'yyyy/MM/dd HH:mm:ss'),
          },
        },
      ]}
    />

    <ListItemGroup
      className="mt-20"
      items={[
        {
          hidden: actions.isSwitchNeeded,
          title: localize('database.sync', 'Sync'),
          mode: {
            type: 'button',
            theme: 'primary',
          },
          onClick: actions.handleSync,
        },
        {
          hidden: !actions.isSwitchNeeded,
          title: localize('database.switch', 'Switch to Database'),
          mode: {
            type: 'button',
            theme: 'primary',
            align: 'center',
          },
          onClick: actions.handleSwitchToDatabase,
        },
        {
          title: localize('database.delete', 'Delete Database'),
          mode: {
            type: 'button',
            theme: 'danger',
          },
          onClick: () => actions.handleDelete('cloud'),
        },
      ]}
    />
  </>
);
