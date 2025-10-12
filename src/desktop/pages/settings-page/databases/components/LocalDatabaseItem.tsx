import { DatabaseIcon } from '@/components/icons';
import { DatabaseItem } from '@/desktop/components/DatabaseItem';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';
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
      icon={<DatabaseIcon />}
      description={database.databaseName}
      title={localize('settings.local.database', 'Local Database')}
      isCurrent={isCurrent}
      onClick={() => databaseActions.handleSwitchToDatabase()}
      actionButtons={
        <SettingButton onClick={databaseActions.handleClearLocalData} variant="text" color="danger" size="small">
          {localize('database.clearData', 'Clear Data')}
        </SettingButton>
      }
    />
  );
};
