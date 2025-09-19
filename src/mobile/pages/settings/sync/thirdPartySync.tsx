import { CloudIcon, SettingsIcon, CircleCheckIcon, DeleteIcon } from '@/components/icons';
import { ListItemGroup, ListItemOption } from '@/mobile/components/listItem/listItem';
import { PageLayout } from '@/mobile/components/PageLayout';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IThirdpartySyncService } from '@/services/thirdpartySync/common/thirdpartySyncService';
import React from 'react';
import { useDialog } from '@/mobile/overlay/dialog/useDialog';
import { useToast } from '@/mobile/overlay/toast/useToast';

export const ThirdPartySyncPage = () => {
  const thirdpartySyncService = useService(IThirdpartySyncService);
  useWatchEvent(thirdpartySyncService.onStateChange);
  const dialog = useDialog();

  useWatchEvent(thirdpartySyncService.onStateChange);
  const toast = useToast();

  const isValidUrl = (url: string): string | undefined => {
    try {
      new URL(url);
      return undefined;
    } catch {
      return localize('sync.error.invalidEndpoint', 'Please enter a valid URL');
    }
  };

  const showCreateConfigDialog = () => {
    dialog({
      title: localize('sync.selfHosted.add', 'Add Self-Hosted Server'),
      actions: [
        {
          key: 'endpoint',
          type: 'input',
          label: localize('sync.endpoint', 'Endpoint'),
          placeholder: 'https://your-server.com',
          inputType: 'url',
          required: true,
          validation: isValidUrl,
        },
        {
          key: 'authToken',
          type: 'input',
          label: localize('sync.authToken', 'Auth Token'),
          placeholder: localize('sync.authTokenPlaceholder', 'Enter your authentication token'),
          inputType: 'password',
          required: true,
        },
        {
          key: 'folderName',
          type: 'input',
          label: localize('sync.folderName', 'Folder Name'),
          placeholder: localize('sync.folderNamePlaceholder', 'tasks'),
          required: true,
        },
      ],
      onConfirm: async (values) => {
        try {
          await thirdpartySyncService.addServer({
            type: 'selfhosted',
            folder: values.folderName as string,
            entrypoint: values.endpoint as string,
            authToken: values.authToken as string,
          });
        } catch (error) {
          toast({ message: (error as Error).message });
          throw error;
        }
      },
    });
  };

  const handleSync = async () => {
    if (thirdpartySyncService.syncing) return;
    try {
      await thirdpartySyncService.sync();
      toast({ message: localize('sync.syncSuccess', 'Sync Successful') });
    } catch (error) {
      toast({ message: (error as Error).message });
    }
  };

  const handleDelete = () => {
    dialog({
      title: localize('sync.confirmDelete', 'Confirm Delete'),
      description: localize(
        'sync.confirmDeleteMessage',
        'Are you sure you want to delete this sync configuration? This action cannot be undone.'
      ),
      confirmText: localize('delete', 'Delete'),
      onConfirm: async () => {
        await thirdpartySyncService.deleteServer();
      },
    });
  };

  const renderConfiguredView = () => {
    if (!thirdpartySyncService.hasServer) return null;

    const configItems: ListItemOption[] = [
      {
        title: localize('sync.serverType', 'Server Type'),
        description: localize('sync.selfHosted', 'Self-Hosted'),
        mode: {
          type: 'label',
          label: '',
        },
      },
      {
        title: localize('sync.endpoint', 'Endpoint'),
        description: thirdpartySyncService.config?.entrypoint || '',
        mode: {
          type: 'label',
          label: '',
        },
      },
      {
        title: localize('sync.folderName', 'Folder Name'),
        description: thirdpartySyncService.config?.folder || '',
        mode: {
          type: 'label',
          label: '',
        },
      },
    ];

    const actionItems: ListItemOption[] = [
      {
        icon: <CircleCheckIcon className="w-5 h-5" />,
        title: thirdpartySyncService.syncing
          ? localize('sync.syncing', 'Syncing...')
          : localize('sync.syncNow', 'Sync Now'),
        onClick: handleSync,
        mode: {
          type: 'button',
          theme: 'primary',
          align: 'center',
        },
      },
      {
        icon: <DeleteIcon className="w-5 h-5" />,
        title: localize('sync.deleteConfig', 'Delete Configuration'),
        onClick: handleDelete,
        mode: {
          type: 'button',
          theme: 'danger',
          align: 'center',
        },
      },
    ];

    return (
      <div className="flex flex-col space-y-4">
        <ListItemGroup title={localize('sync.configuration', 'Configuration')} items={configItems} />
        <ListItemGroup items={actionItems} />
      </div>
    );
  };

  const renderEmptyView = () => {
    const createItem: ListItemOption = {
      title: localize('sync.selfHosted.add', 'Add Self-Hosted Server'),
      onClick: showCreateConfigDialog,
      mode: {
        type: 'button',
        theme: 'primary',
        align: 'center',
      },
    };

    return (
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CloudIcon className="w-12 h-12 text-t3 mb-4" />
          <h3 className="text-lg font-medium text-t1 mb-2">{localize('sync.noConfig', 'No Configuration')}</h3>
          <p className="text-sm text-t2 mb-6 px-4">
            {localize(
              'sync.noConfigDescription',
              'Create a third-party sync configuration to sync your data with external servers.'
            )}
          </p>
        </div>
        <ListItemGroup items={[createItem]} />
      </div>
    );
  };

  return (
    <PageLayout
      header={{
        id: 'third-party-sync',
        title: localize('sync.thirdParty', 'Third-Party Sync'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
      bottomMenu={{
        left: 'back',
      }}
    >
      {thirdpartySyncService.hasServer ? renderConfiguredView() : renderEmptyView()}
    </PageLayout>
  );
};
