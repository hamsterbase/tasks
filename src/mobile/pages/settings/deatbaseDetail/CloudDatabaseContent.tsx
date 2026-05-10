import { useService } from '@/hooks/use-service';
import { ListItemGroup, ListItemOption } from '@/mobile/components/listItem/listItem';
import { useDialog } from '@/mobile/overlay/dialog/useDialog';
import { useToast } from '@/mobile/overlay/toast/useToast';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { DeviceDatabaseItem, ICloudService } from '@/services/cloud/common/cloudService';
import { format } from 'date-fns';
import React from 'react';
import useSWR from 'swr';
import { useDatabaseActions } from './useDatabaseActions';

const MAX_TOKENS_PER_DATABASE = 1;

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

export const CloudDatabaseContent: React.FC<{
  database: DeviceDatabaseItem & { type: 'cloud' };
  actions: ReturnType<typeof useDatabaseActions>;
}> = ({ database, actions }) => {
  const cloudService = useService(ICloudService);
  const dialog = useDialog();
  const toast = useToast();

  const { data: tokens = [], mutate: mutateTokens } = useSWR(
    actions.isSwitchNeeded ? null : ['db-tokens', database.databaseId],
    async () => {
      await cloudService.refreshTaskTokens();
      return cloudService.getCachedTaskTokens(database.databaseId);
    }
  );

  const handleGenerateToken = () => {
    dialog({
      title: localize('database.token.generate', 'Generate Token'),
      confirmText: localize('database.token.generate', 'Generate Token'),
      cancelText: localize('common.cancel', 'Cancel'),
      actions: [
        {
          key: 'name',
          type: 'input',
          placeholder: localize('database.token.namePrompt', 'Token name'),
          required: true,
        },
      ],
      onConfirm: async (actionValues) => {
        // name is required, so it must be a non-empty string, but we still trim it to avoid leading/trailing spaces
        const name = (actionValues.name as string)?.trim();
        try {
          await cloudService.createTaskToken(database.databaseId, name);
          await mutateTokens();
        } catch (error) {
          toast({
            message: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      },
    });
  };

  const handleRevokeToken = (tokenId: string) => {
    dialog({
      title: localize('database.token.revoke', 'Revoke'),
      description: localize('database.token.revoke.confirm', 'Revoke this token? Any apps using it will stop working.'),
      confirmText: localize('database.token.revoke', 'Revoke'),
      cancelText: localize('common.cancel', 'Cancel'),
      onConfirm: async () => {
        try {
          await cloudService.revokeTaskToken(tokenId);
          await mutateTokens();
        } catch (error) {
          toast({
            message: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      },
    });
  };

  const handleCopyToken = (tokenValue: string) => {
    navigator.clipboard.writeText(tokenValue);
    toast({
      message: localize('database.token.copy.success', 'Token copied to clipboard'),
    });
  };

  const tokenItems: ListItemOption[] = [];
  for (const token of tokens) {
    tokenItems.push({
      title: token.name,
      description: token.token,
      mode: { type: 'plain' },
      onClick: () => handleCopyToken(token.token),
    });
    tokenItems.push({
      title: localize('database.token.revoke', 'Revoke'),
      mode: { type: 'button', theme: 'danger' },
      onClick: () => handleRevokeToken(token.id),
    });
  }

  tokenItems.push({
    hidden: tokens.length >= MAX_TOKENS_PER_DATABASE,
    title: localize('database.token.generate', 'Generate Token'),
    mode: { type: 'button', theme: 'primary' },
    onClick: handleGenerateToken,
  });

  return (
    <>
      <ListItemGroup
        items={[
          {
            title: localize('database.databaseName', 'Database Name'),
            mode: {
              type: 'label',
              label: database.databaseName,
            },
          },
          {
            title: localize('database.databaseSize', 'Database Size'),
            mode: {
              type: 'label',
              label: formatBytes(database.usage),
            },
          },
          {
            title: localize('database.lastUpdated', 'Last Updated'),
            mode: {
              type: 'label',
              label: format(database.lastModified, 'yyyy/MM/dd HH:mm:ss'),
            },
          },
        ]}
      />

      {!actions.isSwitchNeeded && (
        <ListItemGroup
          className={styles.settingsListGroupSpacingMd}
          title={localize('database.token.section', 'Inbox Tokens')}
          items={tokenItems}
        />
      )}

      <ListItemGroup
        className={styles.settingsListGroupSpacingXl}
        items={[
          {
            hidden: actions.isSwitchNeeded,
            title: localize('database.sync', 'Sync'),
            mode: {
              type: 'button',
              theme: 'primary',
            },
            onClick: actions.handleSync,
          },
          {
            hidden: !actions.isSwitchNeeded,
            title: localize('database.switch', 'Switch to Database'),
            mode: {
              type: 'button',
              theme: 'primary',
              align: 'center',
            },
            onClick: actions.handleSwitchToDatabase,
          },
          {
            title: localize('database.delete', 'Delete Database'),
            mode: {
              type: 'button',
              theme: 'danger',
            },
            onClick: () => actions.handleDelete('cloud'),
          },
        ]}
      />
    </>
  );
};
