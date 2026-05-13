import { CloudIcon, KeyIcon, SyncIcon, TrashIcon } from '@/components/icons';
import { DatabaseItem } from '@/desktop/components/DatabaseItem';
import { desktopStyles } from '@/desktop/theme/main';
import { useDatabaseActions } from '@/desktop/hooks/useDatabaseActions';
import { localize } from '@/nls.ts';
import { CloudDatabaseItem as CloudDatabaseType } from '@/services/cloud/common/cloudService.ts';
import { format } from 'date-fns';
import React from 'react';
import { CloudDatabaseTokenSection } from './CloudDatabaseTokenSection';
import { useCloudDatabaseTokens } from './useCloudDatabaseTokens';

interface CloudDatabaseItemProps {
  database: CloudDatabaseType;
  isCurrent: boolean;
  mutate: () => Promise<unknown>;
}

export const CloudDatabaseItem: React.FC<CloudDatabaseItemProps> = ({ database, isCurrent, mutate }) => {
  const databaseActions = useDatabaseActions(database.databaseId, database, mutate);
  const tokenState = useCloudDatabaseTokens(database, databaseActions);

  const actionButtons = (
    <>
      {tokenState.canGenerate && (
        <button
          type="button"
          className={desktopStyles.DatabaseItemActionButton}
          title={localize('database.token.generate', 'Generate Token')}
          aria-label={localize('database.token.generate', 'Generate Token')}
          onClick={tokenState.handleGenerate}
        >
          <KeyIcon className={desktopStyles.DatabaseItemActionButtonIcon} strokeWidth={1.75} />
        </button>
      )}
      <button
        type="button"
        className={desktopStyles.DatabaseItemActionButton}
        title={localize('database.sync', 'Sync')}
        aria-label={localize('database.sync', 'Sync')}
        onClick={databaseActions.handleSync}
      >
        <SyncIcon className={desktopStyles.DatabaseItemActionButtonIcon} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        className={desktopStyles.DatabaseItemActionButtonDanger}
        title={localize('database.delete', 'Delete Database')}
        aria-label={localize('database.delete', 'Delete Database')}
        onClick={() => databaseActions.handleDelete('cloud')}
      >
        <TrashIcon className={desktopStyles.DatabaseItemActionButtonIcon} strokeWidth={1.75} />
      </button>
    </>
  );

  const extraSection =
    tokenState.ready && tokenState.tokens && tokenState.tokens.length > 0 ? (
      <CloudDatabaseTokenSection
        tokens={tokenState.tokens}
        onCopy={tokenState.handleCopy}
        onRevoke={tokenState.handleRevoke}
      />
    ) : undefined;

  return (
    <DatabaseItem
      icon={<CloudIcon />}
      title={database.databaseName}
      description={`${localize('settings.cloud.online_database', 'Online Database')} · ${format(database.lastModified, 'yyyy/MM/dd HH:mm:ss')} · ${(database.usage / 1024).toFixed(2)} kb`}
      isCurrent={isCurrent}
      onClick={() => databaseActions.handleSwitchToDatabase()}
      actionButtons={actionButtons}
      extraSection={extraSection}
    />
  );
};
