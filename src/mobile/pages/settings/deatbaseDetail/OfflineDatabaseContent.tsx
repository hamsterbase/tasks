import { DeviceDatabaseItem } from '@/services/cloud/common/cloudService';
import { useDatabaseActions } from './useDatabaseActions';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { localize } from '@/nls';
import React from 'react';

export const OfflineDatabaseContent = ({
  database,
  actions,
}: {
  database: DeviceDatabaseItem & { type: 'offline' };
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
      ]}
    />

    <ListItemGroup
      className="mt-4"
      title={localize('database.isOffline', 'Database is Offline')}
      items={[
        {
          title: localize('database.offline.reason', 'Offline Reason'),
          mode: {
            type: 'label',
            label: database.reason,
          },
        },
      ]}
    />

    <ListItemGroup
      items={[
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
          onClick: () => actions.handleDelete('offline'),
        },
      ]}
    />
  </>
);
