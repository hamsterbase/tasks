import { CloudOffIcon } from '@/components/icons';
import { DatabaseItem } from '@/desktop/components/DatabaseItem';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';
import { useDatabaseActions } from '@/desktop/hooks/useDatabaseActions';
import { localize } from '@/nls.ts';
import { OfflineDatabaseItem as OfflineDatabaseType, formatReason } from '@/services/cloud/common/cloudService.ts';
import React from 'react';

interface OfflineDatabaseItemProps {
  database: OfflineDatabaseType;
  isCurrent: boolean;
  mutate: () => Promise<unknown>;
}

export const OfflineDatabaseItem: React.FC<OfflineDatabaseItemProps> = ({ database, isCurrent, mutate }) => {
  const databaseActions = useDatabaseActions(database.databaseId, database, mutate);

  return (
    <DatabaseItem
      icon={<CloudOffIcon />}
      description={localize('offline.database', 'Offline Database')}
      title={database.databaseName}
      isCurrent={isCurrent}
      properties={[
        {
          label: localize('database.offline.reason', 'Offline Reason'),
          value: formatReason(database.reason),
        },
      ]}
      onClick={() => databaseActions.handleSwitchToDatabase()}
      actionButtons={[
        <SettingButton
          onClick={() => databaseActions.handleDelete('offline')}
          variant="text"
          color="danger"
          size="small"
        >
          {localize('database.delete', 'Delete Database')}
        </SettingButton>,
      ]}
    />
  );
};
