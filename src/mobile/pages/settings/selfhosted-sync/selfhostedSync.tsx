import { CircleCheckIcon, DeleteIcon, SettingsIcon } from '@/components/icons';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ListItemGroup, ListItemOption } from '@/mobile/components/listItem/listItem';
import { PageState } from '@/mobile/components/page-state';
import { PageLayout } from '@/mobile/components/PageLayout';
import { useDialog } from '@/mobile/overlay/dialog/useDialog';
import { useToast } from '@/mobile/overlay/toast/useToast';
import { useAddSelfhostedServer } from '@/services/selfhostedSync/browser/useAddSelfhostedServer';
import { ISelfhostedSyncService } from '@/services/selfhostedSync/common/selfhostedSyncService.ts';
import React from 'react';

export const SelfhostedSync = () => {
  const selfhostedSyncService = useService(ISelfhostedSyncService);
  useWatchEvent(selfhostedSyncService.onStateChange);
  const dialog = useDialog();

  useWatchEvent(selfhostedSyncService.onStateChange);
  const toast = useToast();
  const {
    deleteButtonLabel,
    pageTitle,
    disabledStateMessage,
    emptyStateMessage,
    addButtonLabel,
    syncButtonLabel,
    formItemsLabel,
    handleDeleteServer,
    handleSync,
    onAddServer,
    documentationLink,
  } = useAddSelfhostedServer({
    toast(_type, message) {
      toast({ message });
    },
    handleAddServerDialog(options) {
      dialog(options);
    },
  });

  const renderPageContent = () => {
    if (!selfhostedSyncService.enabled) {
      return (
        <div className="flex flex-col space-y-4">
          <PageState label={disabledStateMessage} />
        </div>
      );
    }
    if (selfhostedSyncService.hasServer) {
      const configItems: ListItemOption[] = [
        {
          title: formItemsLabel.serverType,
          description: formItemsLabel.selfHosted,
          mode: {
            type: 'label',
            label: '',
          },
        },
        {
          title: formItemsLabel.endpoint,
          description: selfhostedSyncService.config?.entrypoint || '',
          mode: {
            type: 'label',
            label: '',
          },
        },
        {
          title: formItemsLabel.folderName,
          description: selfhostedSyncService.config?.folder || '',
          mode: {
            type: 'label',
            label: '',
          },
        },
      ];

      const actionItems: ListItemOption[] = [
        {
          icon: <CircleCheckIcon className="w-5 h-5" />,
          title: syncButtonLabel,
          onClick: handleSync,
          mode: {
            type: 'button',
            theme: 'primary',
            align: 'center',
          },
        },
        {
          icon: <DeleteIcon className="w-5 h-5" />,
          title: deleteButtonLabel,
          onClick: handleDeleteServer,
          mode: {
            type: 'button',
            theme: 'danger',
            align: 'center',
          },
        },
      ];

      return (
        <div className="flex flex-col space-y-4">
          <ListItemGroup items={configItems} />
          <ListItemGroup items={actionItems} />
        </div>
      );
    }

    const createItem: ListItemOption = {
      title: addButtonLabel,
      onClick: onAddServer,
      mode: {
        type: 'button',
        theme: 'primary',
        align: 'center',
      },
    };

    return (
      <div className="flex flex-col space-y-4">
        <PageState label={emptyStateMessage} link={documentationLink} />
        <ListItemGroup items={[createItem]} />
      </div>
    );
  };

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'selfhosted-sync-settings',
        title: pageTitle,
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      {renderPageContent()}
    </PageLayout>
  );
};
