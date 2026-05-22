import { getDeleteDatabaseErrorMessage } from '@/base/common/error';
import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useBack } from '@/hooks/useBack';
import { localize } from '@/nls';
import { IAttachmentUploadService } from '@/services/attachment/common/attachmentUploadService';
import { DeviceDatabaseItem, ICloudService } from '@/services/cloud/common/cloudService';
import { useState, useEffect } from 'react';

export const useDatabaseActions = (
  id: string | undefined,
  database: DeviceDatabaseItem | null,
  mutate: () => Promise<unknown>
) => {
  const cloudService = useService(ICloudService);
  const attachmentService = useService(IAttachmentUploadService);
  useWatchEvent(cloudService.onSessionChange);
  const dialog = useDesktopDialog();
  const back = useBack();
  const desktopMessage = useDesktopMessage();

  const [lastClickTime, setLastClickTime] = useState<Date | undefined>(() => {
    if (!id) return undefined;
    const stored = localStorage.getItem(`db_click_time_${id}`);
    return stored ? new Date(stored) : undefined;
  });

  useEffect(() => {
    if (id && lastClickTime) {
      localStorage.setItem(`db_click_time_${id}`, lastClickTime.toISOString());
    }
  }, [id, lastClickTime]);

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
        actions: [
          {
            type: 'input',
            key: 'password',
            placeholder: localize('database.password', 'Password'),
          },
        ],
        onConfirm: async (action) => {
          if (!action.password) {
            desktopMessage({
              type: 'error',
              message: localize('database.delete.error.emptyPassword', 'Please enter password'),
            });
            throw new Error('emptyPassword');
          }
          if (action && action.password && database.type === 'cloud') {
            try {
              await cloudService.deleteDatabase(id, action.password as string, database.database_salt);
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

  const performSwitch = async () => {
    if (!id || !database) return;
    if (database.type === 'cloud') {
      if (database.exists) {
        await cloudService.switchToLocalDatabase(id);
      } else {
        dialog({
          title: localize('database.switch.to', 'Switch to Database'),
          description: localize('database.switch.desc', 'Enter your password to switch to this database'),
          confirmText: localize('database.switch.confirm', 'Switch'),
          cancelText: localize('common.cancel', 'Cancel'),
          actions: [
            {
              type: 'input',
              key: 'password',
              placeholder: localize('database.password', 'Password'),
            },
          ],
          onConfirm: async (action) => {
            if (!action.password || typeof action.password !== 'string') {
              desktopMessage({
                type: 'error',
                message: localize('database.switch.error.emptyPassword', 'Please enter password'),
              });
              throw new Error('emptyPassword');
            }
            if (action.password) {
              try {
                await cloudService.loginDatabase(
                  id,
                  database.database_salt,
                  action.password as string,
                  database.databaseName
                );
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
    }
  };

  const handleSwitchToDatabase = async () => {
    if (!id || !database) return;
    setLastClickTime(new Date());
    await cloudService.syncImmediately();
    const activeUploads = attachmentService.getActiveUploadCount();
    if (activeUploads > 0) {
      dialog({
        title: localize('attachments.switchConfirmTitle', 'Switch database?'),
        description: localize(
          'attachments.switchConfirmDescription',
          '{0} file(s) are still uploading. Switching will cancel them.',
          activeUploads
        ),
        confirmText: localize('attachments.switchConfirmAction', 'Cancel uploads and switch'),
        cancelText: localize('common.cancel', 'Cancel'),
        onConfirm: async () => {
          await attachmentService.cancelAllUploads();
          await performSwitch();
        },
      });
      return;
    }
    await performSwitch();
  };

  return {
    isSwitchNeeded,
    handleSync,
    handleDelete,
    handleClearLocalData,
    handleSwitchToDatabase,
    lastClickTime,
  };
};
