import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React, { useEffect, useState } from 'react';
import { AlertCircleIcon, CheckIcon, CloseIcon, InfoIcon } from '../../../components/icons';
import { useService } from '../../../hooks/use-service';
import { useWatchEvent } from '../../../hooks/use-watch-event';
import { IWorkbenchOverlayService } from '../../../services/overlay/common/WorkbenchOverlayService';
import { desktopStyles } from '../../theme/main';
import { DesktopMessageController, MessageType } from './DesktopMessageController';

const MessageIcon: React.FC<{ type: MessageType }> = ({ type }) => {
  const iconMap = {
    success: <CheckIcon />,
    error: <AlertCircleIcon />,
    info: <InfoIcon />,
  };

  return iconMap[type];
};

const DesktopMessageContent: React.FC<{ controller: DesktopMessageController }> = ({ controller }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => controller.handleClose(), 200);
  };

  const getIconClass = (type: MessageType) => {
    switch (type) {
      case 'success':
        return desktopStyles.DesktopMessageIconSuccess;
      case 'error':
        return desktopStyles.DesktopMessageIconError;
      case 'info':
        return desktopStyles.DesktopMessageIconInfo;
    }
  };

  return (
    <div
      className={desktopStyles.DesktopMessageContainer}
      style={{
        zIndex: controller.zIndex,
      }}
    >
      <div
        className={`
          ${desktopStyles.DesktopMessageContent}
          ${isVisible && !isLeaving ? desktopStyles.DesktopMessageVisible : desktopStyles.DesktopMessageHidden}
        `}
      >
        <div className={desktopStyles.DesktopMessageInner}>
          <div className={`${desktopStyles.DesktopMessageIcon} ${getIconClass(controller.type)}`}>
            <MessageIcon type={controller.type} />
          </div>

          <div className={desktopStyles.DesktopMessageTextContainer}>
            <p className={desktopStyles.DesktopMessageText}>{controller.message}</p>
          </div>

          <button
            onClick={handleClose}
            className={`${desktopStyles.DesktopMessageCloseButton} ${getIconClass(controller.type)}`}
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export const DesktopMessage: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller = workbenchOverlayService.getOverlay<DesktopMessageController>(OverlayEnum.message);

  useWatchEvent(controller?.onStatusChange);

  if (!controller) return null;

  return (
    <>
      <div key={controller.zIndex}>
        <DesktopMessageContent controller={controller} />
      </div>
    </>
  );
};
