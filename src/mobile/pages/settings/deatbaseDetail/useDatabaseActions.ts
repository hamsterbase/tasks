import { DeviceDatabaseItem } from '@/services/cloud/common/cloudService';

import { useService } from '@/hooks/use-service';
import { useBack } from '@/hooks/useBack';
import { useDialog } from '@/mobile/overlay/dialog/useDialog';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useToast } from '@/mobile/overlay/toast/useToast';
import { getDeleteDatabaseErrorMessage } from '@/base/common/error';

export const useDatabaseActions = (
  id: string | undefined,
  database: DeviceDatabaseItem | null,
  mutate: () => Promise<unknown>
) => {
  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);
  const dialog = useDialog();
  const back = useBack();
  const toast = useToast();

  const isSwitchNeeded = cloudService.databaseConfig !== id;
  const handleSync = async () => {
    if (!id) return;
    await cloudService.syncImmediately();
    toast({
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
        actions: [
          {
            key: 'password',
            type: 'input',
            placeholder: localize('database.password', 'Password'),
            inputType: 'password',
            required: true,
          },
        ],
        onConfirm: async (actionValues) => {
          const password = actionValues.password as string;
          if (!password) {
            toast({
              message: localize('database.delete.error.emptyPassword', 'Please enter password'),
            });
            throw new Error('emptyPassword');
          }
          if (database.type === 'cloud') {
            try {
              await cloudService.deleteDatabase(id, password, database.database_salt);
              back();
            } catch (error) {
              toast({
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
      } else {
        dialog({
          title: localize('database.switch', 'Switch to Database'),
          description: localize('database.switch.desc', 'Enter your password to switch to this database'),
          confirmText: localize('database.switch.confirm', 'Switch'),
          cancelText: localize('common.cancel', 'Cancel'),
          actions: [
            {
              key: 'password',
              type: 'input',
              placeholder: localize('database.password', 'Password'),
              inputType: 'password',
              required: true,
            },
          ],
          onConfirm: async (actionValues) => {
            const password = actionValues.password as string;
            if (!password) {
              toast({
                message: localize('database.switch.error.emptyPassword', 'Please enter password'),
              });
              throw new Error('emptyPassword');
            }
            try {
              await cloudService.loginDatabase(id, database.database_salt, password, database.databaseName);
            } catch (error) {
              console.error(error);
              toast({
                message: getDeleteDatabaseErrorMessage(error),
              });
              throw error;
            }
          },
        });
      }
    } else if (database.type === 'offline' || database.type === 'local') {
      await cloudService.switchToLocalDatabase(id);
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
