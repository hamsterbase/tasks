import { useDatabaseActions } from '@/desktop/hooks/useDatabaseActions';
import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { CloudDatabaseItem, ICloudService } from '@/services/cloud/common/cloudService';
import useSWR from 'swr';

const MAX_TOKENS_PER_DATABASE = 1;

export const useCloudDatabaseTokens = (database: CloudDatabaseItem, actions: ReturnType<typeof useDatabaseActions>) => {
  const cloudService = useService(ICloudService);
  const dialog = useDesktopDialog();
  const desktopMessage = useDesktopMessage();

  const { data: tokens = null, mutate: mutateTokens } = useSWR(
    actions.isSwitchNeeded ? null : ['db-tokens', database.databaseId],
    async () => {
      await cloudService.refreshTaskTokens();
      return cloudService.getCachedTaskTokens(database.databaseId);
    }
  );

  const handleGenerate = () => {
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
        const name = (actionValues.name as string)?.trim();
        try {
          await cloudService.createTaskToken(database.databaseId, name);
          await mutateTokens();
        } catch (error) {
          desktopMessage({
            type: 'error',
            message: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      },
    });
  };

  const handleRevoke = (tokenId: string) => {
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
          desktopMessage({
            type: 'error',
            message: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      },
    });
  };

  const handleCopy = (tokenValue: string) => {
    navigator.clipboard.writeText(tokenValue);
    desktopMessage({
      type: 'success',
      message: localize('database.token.copy.success', 'Token copied to clipboard'),
    });
  };

  const ready = !actions.isSwitchNeeded && tokens !== null;
  const canGenerate = ready && (tokens?.length ?? 0) < MAX_TOKENS_PER_DATABASE;

  return {
    tokens,
    ready,
    canGenerate,
    handleGenerate,
    handleRevoke,
    handleCopy,
  };
};
