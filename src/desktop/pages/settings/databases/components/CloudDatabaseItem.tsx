import { CloudIcon } from '@/components/icons';
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

  const getIcon = () => {
    return <CloudIcon className="w-5 h-5 text-brand" />;
  };

  const getDescription = () => {
    return `${new Date(database.lastModified).toLocaleDateString()} · ${(database.usage / 1024).toFixed(2)} kb`;
  };

  const DatabaseDetail = () => (
    <div className="px-3 py-3 bg-bg1 rounded-b-lg -mt-2">
      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium text-t2 mb-1">{localize('database.databaseSize', 'Database Size')}</div>
          <div className="text-t1">{formatBytes(database.usage)}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-t2 mb-1">{localize('database.lastUpdated', 'Last Updated')}</div>
          <div className="text-t1">{format(database.lastModified, 'yyyy/MM/dd HH:mm:ss')}</div>
        </div>

        <div className="flex space-x-2 pt-2">
          {!databaseActions.isSwitchNeeded && (
            <button
              onClick={databaseActions.handleSync}
              className="px-3 py-1.5 text-sm bg-brand text-white rounded hover:bg-brand/80"
            >
              {localize('database.sync', 'Sync')}
            </button>
          )}

          {databaseActions.isSwitchNeeded && (
            <button
              onClick={databaseActions.handleSwitchToDatabase}
              className="px-3 py-1.5 text-sm bg-brand text-white rounded hover:bg-brand/80"
            >
              {localize('database.switch', 'Switch to Database')}
            </button>
          )}

          <button
            onClick={() => databaseActions.handleDelete('cloud')}
            className="px-3 py-1.5 text-sm bg-stress-red text-white rounded hover:bg-stress-red/80"
          >
            {localize('database.delete', 'Delete Database')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <button
        onClick={databaseActions.handleSwitchToDatabase}
        disabled={isCurrent}
        className={`w-full flex items-center space-x-3 py-3 px-3 ${isCurrent ? 'rounded-t-lg' : 'rounded-lg'} transition-colors text-left ${
          isCurrent ? 'bg-bg1' : 'bg-bg3 hover:bg-line-light cursor-pointer'
        }`}
      >
        {getIcon()}
        <div className="flex-1">
          <div className="text-t1 font-medium">{database.databaseName}</div>
          <div className="text-t2 text-sm">{getDescription()}</div>
        </div>
        {isCurrent && (
          <div className="text-xs text-brand font-medium">
            {localize('settings.cloud.currentDatabase', 'Current Database')}
          </div>
        )}
        {!isCurrent && (
          <div className="text-xs text-t3">{localize('settings.database.clickToSwitch', 'Click to switch')}</div>
        )}
      </button>

      {isCurrent && <DatabaseDetail />}
    </div>
  );
};
