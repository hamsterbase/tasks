import { DatabaseIcon, TrashIcon } from '@/components/icons';
import { DatabaseItem } from '@/desktop/components/DatabaseItem';
import { desktopStyles } from '@/desktop/theme/main';
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
      description={localize('settings.local.database.description', 'Local data stored on this device')}
      title={localize('settings.local.database', 'Local Database')}
      isCurrent={isCurrent}
      onClick={() => databaseActions.handleSwitchToDatabase()}
      actionButtons={
        <button
          type="button"
          className={desktopStyles.DatabaseItemActionButtonDanger}
          title={localize('database.clearData', 'Clear Data')}
          aria-label={localize('database.clearData', 'Clear Data')}
          onClick={databaseActions.handleClearLocalData}
        >
          <TrashIcon className={desktopStyles.DatabaseItemActionButtonIcon} strokeWidth={1.75} />
        </button>
      }
    />
  );
};
