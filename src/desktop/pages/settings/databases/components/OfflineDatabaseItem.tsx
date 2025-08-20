import { CloudOffIcon } from '@/components/icons';
import { DatabaseItem } from '@/desktop/components/DatabaseItem';
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
      icon={<CloudOffIcon className="w-5 h-5 text-stress-red" />}
      title={localize('offline.database', 'Offline Database')}
      description={database.databaseName}
      isCurrent={isCurrent}
      properties={[
        {
          label: localize('database.offline.reason', 'Offline Reason'),
          value: formatReason(database.reason),
        },
      ]}
      onClick={() => databaseActions.handleSwitchToDatabase()}
      actionButtons={[
        <button
          onClick={() => databaseActions.handleDelete('offline')}
          className="px-3 py-1.5 text-sm bg-stress-red text-white rounded hover:bg-stress-red/80"
        >
          {localize('database.delete', 'Delete Database')}
        </button>,
      ]}
    />
  );
};
