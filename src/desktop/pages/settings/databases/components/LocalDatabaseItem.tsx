import { DatabaseIcon } from '@/components/icons';
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

  const getIcon = () => {
    return <DatabaseIcon className="w-5 h-5 text-t2" />;
  };

  const getDescription = () => {
    return localize('settings.local.database', 'Local Database');
  };

  const DatabaseDetail = () => (
    <div className="px-3 py-3 bg-bg1 rounded-b-lg -mt-2">
      <div className="space-y-3">
        <div className="flex space-x-2 pt-2">
          <button
            onClick={databaseActions.handleClearLocalData}
            className="px-3 py-1.5 text-sm bg-stress-red text-white rounded hover:bg-stress-red/80"
          >
            {localize('database.clearData', 'Clear Data')}
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
