import { CloseIcon } from '@/components/icons';
import { InfoItem } from '@/desktop/components/InfoItem';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';
import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsEmptyStateAction } from '@/desktop/components/Settings/SettingsEmptyStateAction';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { useAddSelfhostedServer } from '@/services/selfhostedSync/browser/useAddSelfhostedServer';
import { ISelfhostedSyncService } from '@/services/selfhostedSync/common/selfhostedSyncService';
import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { TestIds } from '@/testIds';

export const SelfHostedSyncSettings: React.FC = () => {
  const selfhostedSyncService = useService(ISelfhostedSyncService);
  useWatchEvent(selfhostedSyncService.onStateChange);
  const showMessage = useDesktopMessage();
  const location = useLocation();
  const navigate = useNavigate();
  const [endpoint, setEndpoint] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [folder, setFolder] = useState('');
  const {
    syncButtonLabel,
    pageTitle,
    disabledStateMessage,
    formItemsLabel,
    handleDeleteServer,
    handleSync,
    deleteButtonLabel,
    documentationLink,
  } = useAddSelfhostedServer({
    toast(type, message) {
      showMessage({
        type: type,
        message,
      });
    },
    handleAddServerDialog() {
      // The desktop settings page uses an inline dialog to stay pixel-aligned with ui-pc.
    },
  });
  const emptyStateTitle = localize('sync.selfHostedServer', 'Selfhosted Server');
  const emptyStateDescription = localize(
    'sync.selfHostedNoConfigDescription',
    'No server configured yet. Add one to sync tasks across devices.'
  );
  const addServerButtonLabel = localize('sync.addServer', 'Add Server');
  const addServerDialogTitle = localize('sync.selfHosted.add', 'Add Selfhosted Server');
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isAddServerDialogVisible = searchParams.get('dialog') === 'add-server';
  const isEndpointValid = useMemo(() => {
    if (!endpoint.trim()) return false;
    try {
      new URL(endpoint.trim());
      return true;
    } catch {
      return false;
    }
  }, [endpoint]);
  const isAddServerFormValid = isEndpointValid && authToken.trim() !== '' && folder.trim() !== '';

  const openAddServerDialog = () => {
    navigate(`${location.pathname}?dialog=add-server`);
  };

  const closeAddServerDialog = () => {
    navigate(location.pathname, { replace: true });
  };

  const handleConfirmAddServer = async () => {
    if (!isAddServerFormValid) return;

    try {
      await selfhostedSyncService.addServer({
        type: 'selfhosted',
        entrypoint: endpoint.trim(),
        authToken: authToken.trim(),
        folder: folder.trim(),
      });
      showMessage({
        type: 'success',
        message: localize('sync.addServerSuccess', 'Server added successfully'),
      });
      setEndpoint('');
      setAuthToken('');
      setFolder('');
      closeAddServerDialog();
    } catch (error) {
      showMessage({
        type: 'error',
        message: (error as Error).message,
      });
    }
  };

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
            <div className={desktopStyles.SettingsButtonRow}>
              <SettingButton
                variant="filled"
                size="medium"
                inline
                onClick={handleSync}
                disabled={selfhostedSyncService.syncing}
              >
                {syncButtonLabel}
              </SettingButton>
            </div>
            <ItemGroup>
              <div className={desktopStyles.SettingsItemContainer}>
                <div className={desktopStyles.SettingsItemContentWrapper}>
                  <span className={desktopStyles.SettingsItemTitle}>{deleteButtonLabel}</span>
                  <span className={desktopStyles.SettingsItemDescription}>
                    {localize(
                      'sync.deleteServer.description',
                      'This action cannot be undone and will remove the server configuration from this device.'
                    )}
                  </span>
                </div>
                <div className={desktopStyles.SettingsItemActionWrapper}>
                  <SettingButton color="danger" size="small" onClick={handleDeleteServer} inline>
                    {localize('database.delete', 'Delete Database')}
                  </SettingButton>
                </div>
              </div>
            </ItemGroup>
          </>
        );
      } else {
        return (
          <ItemGroup>
            <div className={desktopStyles.SettingsItemContainer}>
              <div className={desktopStyles.SettingsItemContentWrapper}>
                <span className={desktopStyles.SettingsItemTitle}>{emptyStateTitle}</span>
                <span className={desktopStyles.SettingsItemDescription}>{emptyStateDescription}</span>
              </div>
              <div className={desktopStyles.SettingsItemActionWrapper}>
                <SettingsEmptyStateAction onClick={openAddServerDialog}>
                  {addServerButtonLabel}
                </SettingsEmptyStateAction>
              </div>
            </div>
          </ItemGroup>
        );
      }
    }

    return (
      <ItemGroup>
        <div className="w-full px-4 py-12 text-center">
          <p className="text-sm text-t3">{disabledStateMessage}</p>
          {documentationLink && (
            <a
              href={documentationLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center text-sm text-brand transition-colors hover:text-brand/80"
            >
              {documentationLink.text}
            </a>
          )}
        </div>
      </ItemGroup>
    );
  };

  return (
    <SettingsContent title={pageTitle}>
      {renderDisabledView()}
      {isAddServerDialogVisible && (
        <div className={desktopStyles.SettingsDialogRoot}>
          <div className={desktopStyles.SettingsDialogBackdrop} onClick={closeAddServerDialog} />
          <div className={desktopStyles.SettingsDialogSurface} data-test-id={TestIds.DesktopDialog.Container}>
            <div className={desktopStyles.SettingsDialogHeader}>
              <h3 className={desktopStyles.SettingsDialogTitle}>{addServerDialogTitle}</h3>
              <button
                type="button"
                className={desktopStyles.SettingsDialogCloseButton}
                onClick={closeAddServerDialog}
                aria-label={localize('common.close', 'Close')}
              >
                <CloseIcon className={desktopStyles.SettingsDialogCloseIcon} strokeWidth={1.75} />
              </button>
            </div>
            <div className={desktopStyles.SettingsDialogContent}>
              <div className={desktopStyles.SettingsDialogActions}>
                <div className={desktopStyles.SettingsDialogField}>
                  <label className={desktopStyles.SettingsDialogLabel}>
                    {formItemsLabel.endpoint}
                    <span className={desktopStyles.SettingsDialogRequired}>*</span>
                  </label>
                  <input
                    type="url"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className={desktopStyles.SettingsDialogInput}
                    placeholder="https://your-server.com"
                  />
                </div>
                <div className={desktopStyles.SettingsDialogField}>
                  <label className={desktopStyles.SettingsDialogLabel}>
                    {formItemsLabel.authToken}
                    <span className={desktopStyles.SettingsDialogRequired}>*</span>
                  </label>
                  <input
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    className={desktopStyles.SettingsDialogInput}
                    placeholder={localize('sync.authTokenPlaceholder', 'Enter your authentication token')}
                  />
                </div>
                <div className={desktopStyles.SettingsDialogField}>
                  <label className={desktopStyles.SettingsDialogLabel}>
                    {formItemsLabel.folderName}
                    <span className={desktopStyles.SettingsDialogRequired}>*</span>
                  </label>
                  <input
                    type="text"
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className={desktopStyles.SettingsDialogInput}
                    placeholder={localize('sync.folderNamePlaceholder', 'tasks')}
                  />
                </div>
              </div>
            </div>
            <div className={desktopStyles.SettingsDialogFooter}>
              <button type="button" className={desktopStyles.SettingsDialogCancelButton} onClick={closeAddServerDialog}>
                {localize('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                className={desktopStyles.SettingsDialogConfirmButton}
                disabled={!isAddServerFormValid}
                onClick={handleConfirmAddServer}
              >
                {localize('confirm', 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsContent>
  );
};
