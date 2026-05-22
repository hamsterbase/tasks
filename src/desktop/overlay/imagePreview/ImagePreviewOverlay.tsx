import { CloseIcon, DownloadIcon, Loader2Icon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IAttachmentUploadService } from '@/services/attachment/common/attachmentUploadService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import React, { useEffect, useState } from 'react';
import { ImagePreviewController } from './ImagePreviewController';

const ImagePreviewContent: React.FC<{ controller: ImagePreviewController }> = ({ controller }) => {
  const attachmentService = useService(IAttachmentUploadService);
  const [url, setUrl] = useState<string | null>(null);
  const attachment = controller.attachment;

  useEffect(() => {
    let revoked = false;
    let createdUrl: string | null = null;
    void attachmentService.getObjectUrl(attachment.s3Key).then((u) => {
      if (revoked) {
        if (u) URL.revokeObjectURL(u);
        return;
      }
      createdUrl = u;
      setUrl(u);
    });
    return () => {
      revoked = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [attachment.s3Key, attachmentService]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') controller.close();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [controller]);

  const handleDownload = () => {
    void attachmentService.downloadAttachment(attachment.s3Key, attachment.filename);
  };

  return (
    <div
      className={desktopStyles.ImagePreviewBackdrop}
      style={{ zIndex: controller.zIndex }}
      onClick={() => controller.close()}
    >
      <button
        type="button"
        className={desktopStyles.ImagePreviewDownloadButton}
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}
        title={localize('attachments.download', 'Download')}
      >
        <DownloadIcon className={desktopStyles.ImagePreviewActionIcon} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        className={desktopStyles.ImagePreviewCloseButton}
        onClick={() => controller.close()}
        title={localize('common.close', 'Close')}
      >
        <CloseIcon className={desktopStyles.ImagePreviewActionIcon} strokeWidth={1.75} />
      </button>
      {url ? (
        <img
          src={url}
          alt={attachment.filename}
          className={desktopStyles.ImagePreviewImage}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <Loader2Icon className={desktopStyles.ImagePreviewLoading} strokeWidth={1.5} />
      )}
    </div>
  );
};

export const ImagePreviewOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: ImagePreviewController | null = workbenchOverlayService.getOverlay(OverlayEnum.imagePreview);
  useWatchEvent(controller?.onStatusChange);
  if (!controller) return null;
  return <ImagePreviewContent controller={controller} />;
};
