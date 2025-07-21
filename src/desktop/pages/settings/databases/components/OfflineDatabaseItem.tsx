import { CloudOffIcon } from '@/components/icons';
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

  const getIcon = () => {
    return <CloudOffIcon className="w-5 h-5 text-stress-red" />;
  };

  const getDescription = () => {
    return formatReason(database.reason);
  };

  const DatabaseDetail = () => (
    <div className="px-3 py-3 bg-bg1 rounded-b-lg -mt-2">
      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium text-t2 mb-1">{localize('database.offline.reason', 'Reason')}</div>
          <div className="text-t1">{database.reason}</div>
        </div>

        <div className="flex space-x-2 pt-2">
          {databaseActions.isSwitchNeeded && (
            <button
              onClick={databaseActions.handleSwitchToDatabase}
              className="px-3 py-1.5 text-sm bg-brand text-white rounded hover:bg-brand/80"
            >
              {localize('database.switch', 'Switch to Database')}
            </button>
          )}

          <button
            onClick={() => databaseActions.handleDelete('offline')}
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
