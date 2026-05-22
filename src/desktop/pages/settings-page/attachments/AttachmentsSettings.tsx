import { PaperclipIcon, TrashIcon, EditIcon } from '@/components/icons';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsEmptyStateAction } from '@/desktop/components/Settings/SettingsEmptyStateAction';
import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { useAttachmentsConfigOverlay } from '@/desktop/overlay/attachmentsConfig/useAttachmentsConfigOverlay';
import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IAttachmentUploadService } from '@/services/attachment/common/attachmentUploadService';
import { ICloudService } from '@/services/cloud/common/cloudService';
import React from 'react';
import useSWR from 'swr';

export const AttachmentsSettings: React.FC = () => {
  const attachmentService = useService(IAttachmentUploadService);
  const cloudService = useService(ICloudService);
  useWatchEvent(attachmentService.onChange);
  useWatchEvent(cloudService.onSessionChange);
  const showMessage = useDesktopMessage();
  const confirmDialog = useDesktopDialog();
  const openConfigOverlay = useAttachmentsConfigOverlay();

  const { data: databases } = useSWR(['attachments-db-list', cloudService.databaseConfig], () =>
    cloudService.listDatabases()
  );

  const currentDb = databases?.find((db) => db.databaseId === cloudService.databaseConfig);
  const currentDbName = currentDb?.databaseName ?? cloudService.databaseConfig;

  const config = attachmentService.getConfig();
  const hasConfig = !!config;

  const handleOpenConfig = () => {
    openConfigOverlay({ initialConfig: attachmentService.getConfig() });
  };

  const handleClear = () => {
    confirmDialog({
      title: localize('attachments.clearConfirmTitle', 'Clear S3 configuration?'),
      description: localize(
        'attachments.clearConfirmDescription',
        'Existing attachments will become inaccessible until you reconfigure S3. The files in S3 will not be deleted.'
      ),
      confirmText: localize('attachments.clear', 'Clear'),
      cancelText: localize('common.cancel', 'Cancel'),
      onConfirm: async () => {
        await attachmentService.setConfig(null);
        showMessage({
          type: 'success',
          message: localize('attachments.cleared', 'S3 configuration cleared'),
        });
      },
    });
  };

  return (
    <SettingsContent title={localize('settings.attachments', 'Attachments')}>
      <div className={desktopStyles.AttachmentSettingsWrapper}>
        <p className={desktopStyles.AttachmentSettingsIntro}>
          {localize('attachments.intro', 'Configure S3-compatible storage for attachments in ')}
          <span className={desktopStyles.AttachmentSettingsIntroEmphasis}>{currentDbName}</span>
          {localize('attachments.introSuffix', '. Configuration is stored locally on this device.')}
        </p>

        {hasConfig ? (
          <div className={desktopStyles.AttachmentsRowContainer} onClick={handleOpenConfig}>
            <div className={desktopStyles.AttachmentsRowIcon}>
              <PaperclipIcon className={desktopStyles.AttachmentsRowIconSvg} strokeWidth={1.75} />
            </div>
            <div className={desktopStyles.AttachmentsRowContent}>
              <div className={desktopStyles.AttachmentsRowTitleRow}>
                <span className={desktopStyles.AttachmentsRowTitle}>{config!.bucket}</span>
                <span className={desktopStyles.AttachmentsRowBadge}>
                  {localize('attachments.configured', 'Configured')}
                </span>
              </div>
              <span className={desktopStyles.AttachmentsRowDescription}>{config!.endpoint}</span>
            </div>
            <div className={desktopStyles.AttachmentsRowActions} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={desktopStyles.AttachmentsRowActionButton}
                title={localize('attachments.edit', 'Edit')}
                onClick={handleOpenConfig}
              >
                <EditIcon className={desktopStyles.AttachmentsRowActionIcon} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                className={desktopStyles.AttachmentsRowActionButtonDanger}
                title={localize('attachments.clear', 'Clear')}
                onClick={handleClear}
              >
                <TrashIcon className={desktopStyles.AttachmentsRowActionIcon} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ) : (
          <ItemGroup>
            <div className={desktopStyles.SettingsItemContainer}>
              <div className={desktopStyles.SettingsItemContentWrapper}>
                <span className={desktopStyles.SettingsItemTitle}>
                  {localize('attachments.notConfigured', 'S3 storage not configured')}
                </span>
                <span className={desktopStyles.SettingsItemDescription}>
                  {localize(
                    'attachments.notConfiguredDesc',
                    'Add S3-compatible storage to enable attachments for tasks and projects.'
                  )}
                </span>
              </div>
              <div className={desktopStyles.SettingsItemActionWrapper}>
                <SettingsEmptyStateAction onClick={handleOpenConfig}>
                  {localize('attachments.configure', 'Configure')}
                </SettingsEmptyStateAction>
              </div>
            </div>
          </ItemGroup>
        )}
      </div>
    </SettingsContent>
  );
};
