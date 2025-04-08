import { localize } from '@/nls';
import { useDatabaseActions } from './useDatabaseActions';
import { DeviceDatabaseItem } from '@/services/cloud/common/cloudService';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import React from 'react';

export const LocalDatabaseContent = ({
  database,
  actions,
}: {
  database: DeviceDatabaseItem & { type: 'local' };
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
      className="mt-20"
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
          title: localize('database.clearData', 'Clear Data'),
          mode: {
            type: 'button',
            theme: 'danger',
          },
          onClick: actions.handleClearLocalData,
        },
      ]}
    />
  </>
);
