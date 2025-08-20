import { DatabaseIcon } from '@/components/icons';
import { DatabaseItem } from '@/desktop/components/DatabaseItem';
import { useDatabaseActions } from '@/desktop/hooks/useDatabaseActions';
import { localize } from '@/nls.ts';
import { LocalDatabaseItem as LocalDatabaseType } from '@/services/cloud/common/cloudService.ts';
import React from 'react';

interface LocalDatabaseItemProps {
  database: LocalDatabaseType;
  isCurrent: boolean;
  mutate: () => Promise<unknown>;
}

export const LocalDatabaseItem: React.FC<LocalDatabaseItemProps> = ({ database, isCurrent, mutate }) => {
  const databaseActions = useDatabaseActions(database.databaseId, database, mutate);

  return (
    <DatabaseItem
      icon={<DatabaseIcon className="w-5 h-5 text-t2" />}
      title={database.databaseName}
      description={localize('settings.local.database', 'Local Database')}
      isCurrent={isCurrent}
      onClick={() => databaseActions.handleSwitchToDatabase()}
      actionButtons={
        <button
          onClick={databaseActions.handleClearLocalData}
          className="px-3 py-1.5 text-sm bg-stress-red text-white rounded hover:bg-stress-red/80"
        >
          {localize('database.clearData', 'Clear Data')}
        </button>
      }
    />
  );
};
