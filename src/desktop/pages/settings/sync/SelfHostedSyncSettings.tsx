import { InfoItem } from '@/desktop/components/InfoItem';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';
import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsTitle } from '@/desktop/components/Settings/SettingsTitle';
import { Space } from '@/desktop/components/Space/Space';
import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useAddSelfhostedServer } from '@/services/selfhostedSync/browser/useAddSelfhostedServer';
import { ISelfhostedSyncService } from '@/services/selfhostedSync/common/selfhostedSyncService';
import React from 'react';
import { EmptyStateMessage } from './components/EmptyStateMessage';

export const SelfHostedSyncSettings: React.FC = () => {
  const selfhostedSyncService = useService(ISelfhostedSyncService);
  useWatchEvent(selfhostedSyncService.onStateChange);
  const desktopDialog = useDesktopDialog();
  const showMessage = useDesktopMessage();
  const {
    onAddServer,
    syncButtonLabel,
    addButtonLabel,
    pageTitle,
    emptyStateMessage,
    disabledStateMessage,
    formItemsLabel,
    handleDeleteServer,
    handleSync,
    deleteButtonLabel,
  } = useAddSelfhostedServer({
    toast(type, message) {
      showMessage({
        type: type,
        message,
      });
    },
    handleAddServerDialog(options) {
      desktopDialog(options);
    },
  });

  const renderDisabledView = () => {
    if (selfhostedSyncService.enabled) {
      if (selfhostedSyncService.hasServer) {
        const config = selfhostedSyncService.config;
        if (!config) return null;
        return (
          <>
            <ItemGroup>
              <InfoItem label={formItemsLabel.serverType} value={formItemsLabel.selfHosted} />
              <InfoItem label={formItemsLabel.endpoint} value={config.entrypoint} />
              <InfoItem label={formItemsLabel.folderName} value={config.folder} />
            </ItemGroup>
            <Space size="medium" />
            <div className={desktopStyles.AccountSettingsButtonContainer}>
              <SettingButton variant="filled" onClick={handleSync} disabled={selfhostedSyncService.syncing}>
                {syncButtonLabel}
              </SettingButton>
              <SettingButton color="danger" onClick={handleDeleteServer}>
                {deleteButtonLabel}
              </SettingButton>
            </div>
          </>
        );
      } else {
        return (
          <ItemGroup>
            <EmptyStateMessage message={emptyStateMessage} />
          </ItemGroup>
        );
      }
    }

    return (
      <>
        <ItemGroup>
          <EmptyStateMessage message={disabledStateMessage} />
        </ItemGroup>
      </>
    );
  };

  return (
    <SettingsContent>
      <SettingsTitle
        title={pageTitle}
        action={
          selfhostedSyncService.showCreateButton && (
            <SettingButton variant="solid" color="primary" size="small" onClick={onAddServer}>
              {addButtonLabel}
            </SettingButton>
          )
        }
      />
      {renderDisabledView()}
    </SettingsContent>
  );
};
