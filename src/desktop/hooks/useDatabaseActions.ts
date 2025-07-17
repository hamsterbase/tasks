import { getDeleteDatabaseErrorMessage } from '@/base/common/error';
import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useBack } from '@/hooks/useBack';
import { localize } from '@/nls';
import { DeviceDatabaseItem, ICloudService } from '@/services/cloud/common/cloudService';

export const useDatabaseActions = (
  id: string | undefined,
  database: DeviceDatabaseItem | null,
  mutate: () => Promise<unknown>
) => {
  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);
  const dialog = useDesktopDialog();
  const back = useBack();
  const desktopMessage = useDesktopMessage();

  const isSwitchNeeded = cloudService.databaseConfig !== id;
  const handleSync = async () => {
    if (!id) return;
    await cloudService.syncImmediately();
    desktopMessage({
      type: 'success',
      message: localize('database.sync.success', 'Sync successfully'),
    });
    await mutate();
  };

  const handleDelete = (type: 'cloud' | 'offline') => {
    if (!id || !database) return;
    if (type === 'cloud' && database.type === 'cloud') {
      dialog({
        title: localize('database.delete', 'Delete Database'),
        description: localize(
          'database.delete.confirm',
          'Please enter database password to confirm. This action cannot be undone.'
        ),
        confirmText: localize('database.delete', 'Delete Database'),
        cancelText: localize('common.cancel', 'Cancel'),
        actions: {
          type: 'input',
          placeholder: localize('database.password', 'Password'),
        },
        onConfirm: async (action) => {
          if (!action?.value) {
            desktopMessage({
              type: 'error',
              message: localize('database.delete.error.emptyPassword', 'Please enter password'),
            });
            throw new Error('emptyPassword');
          }
          if (action && action.value && database.type === 'cloud') {
            try {
              await cloudService.deleteDatabase(id, action.value, database.database_salt);
              back();
            } catch (error) {
              desktopMessage({
                type: 'error',
                message: getDeleteDatabaseErrorMessage(error),
              });
              throw error;
            }
          }
        },
      });
    } else if (type === 'offline') {
      dialog({
        title: localize('database.delete', 'Delete Database'),
        description: localize(
          'database.delete.offline.confirm',
          'Are you sure you want to delete this offline database? This action cannot be undone.'
        ),
        confirmText: localize('database.delete', 'Delete Database'),
        cancelText: localize('common.cancel', 'Cancel'),
        onConfirm: async () => {
          await cloudService.deleteLocalDatabase(id);
          back();
        },
      });
    }
  };

  const handleClearLocalData = () => {
    if (!id || !database || database.type !== 'local') return;
    dialog({
      title: localize('database.clearData', 'Clear Data'),
      description: localize(
        'database.clearData.confirm',
        'Are you sure you want to clear all data? This action cannot be undone.'
      ),
      confirmText: localize('database.clearData', 'Clear Data'),
      cancelText: localize('common.cancel', 'Cancel'),
      onConfirm: async () => {
        await cloudService.deleteLocalDatabase(id);
        await mutate();
      },
    });
  };

  const handleSwitchToDatabase = async () => {
    if (!id || !database) return;
    await cloudService.syncImmediately();
    if (database.type === 'cloud') {
      if (database.exists) {
        await cloudService.switchToLocalDatabase(id);
        window.location.reload();
      } else {
        dialog({
          title: localize('database.switch', 'Switch to Database'),
          description: localize('database.switch.desc', 'Enter your password to switch to this database'),
          confirmText: localize('database.switch.confirm', 'Switch'),
          cancelText: localize('common.cancel', 'Cancel'),
          actions: {
            type: 'input',
            placeholder: localize('database.password', 'Password'),
          },
          onConfirm: async (action) => {
            if (!action?.value) {
              desktopMessage({
                type: 'error',
                message: localize('database.switch.error.emptyPassword', 'Please enter password'),
              });
              throw new Error('emptyPassword');
            }
            if (action && action.value) {
              try {
                await cloudService.loginDatabase(id, database.database_salt, action.value, database.databaseName);
                window.location.reload();
              } catch (error) {
                console.error(error);
                desktopMessage({
                  type: 'error',
                  message: getDeleteDatabaseErrorMessage(error),
                });
                throw error;
              }
            }
          },
        });
      }
    } else if (database.type === 'offline' || database.type === 'local') {
      await cloudService.switchToLocalDatabase(id);
      window.location.reload();
    }
  };

  return {
    isSwitchNeeded,
    handleSync,
    handleDelete,
    handleClearLocalData,
    handleSwitchToDatabase,
  };
};
