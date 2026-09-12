import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React, { useEffect, useRef, useState } from 'react';
import { AlertCircleIcon, CheckIcon, CloseIcon, InfoIcon } from '../../../components/icons';
import { useService } from '../../../hooks/use-service';
import { useWatchEvent } from '../../../hooks/use-watch-event';
import { IWorkbenchOverlayService } from '../../../services/overlay/common/WorkbenchOverlayService';
import { desktopStyles } from '../../theme/main';
import { DesktopMessageController, MessageItem, MessageType } from './DesktopMessageController';
import { localize } from '@/nls';

const MessageIcon: React.FC<{ type: MessageType }> = ({ type }) => {
  const iconMap = {
    success: <CheckIcon className={desktopStyles.DesktopMessageIconSvg} />,
    error: <AlertCircleIcon className={desktopStyles.DesktopMessageIconSvg} />,
    info: <InfoIcon className={desktopStyles.DesktopMessageIconSvg} />,
  };

  return iconMap[type];
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

const DesktopMessageItem: React.FC<{ item: MessageItem; controller: DesktopMessageController }> = ({
  item,
  controller,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (item.bump > 0) {
      contentRef.current?.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }],
        { duration: 250, easing: 'ease-out' }
      );
    }
  }, [item.bump]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => controller.close(item.id), 200);
  };

  const handleUndo = () => {
    controller.undo(item.id);
    handleClose();
  };

  return (
    <div
      ref={contentRef}
      className={`
        ${desktopStyles.DesktopMessageContent}
        ${isVisible && !isLeaving ? desktopStyles.DesktopMessageVisible : desktopStyles.DesktopMessageHidden}
      `}
    >
      <div className={desktopStyles.DesktopMessageInner}>
        <div className={`${desktopStyles.DesktopMessageIcon} ${getIconClass(item.options.type)}`}>
          <MessageIcon type={item.options.type} />
        </div>

        <div className={desktopStyles.DesktopMessageTextContainer}>
          <p className={desktopStyles.DesktopMessageText}>{item.options.message}</p>
          {item.options.description && (
            <p className={desktopStyles.DesktopMessageDescription}>{item.options.description}</p>
          )}
        </div>
        <button onClick={handleClose} className={`${desktopStyles.DesktopMessageCloseButton}`}>
          <CloseIcon className={desktopStyles.DesktopMessageCloseIcon} />
        </button>
      </div>
      {!!item.options.undo && (
        <div className={desktopStyles.DesktopMessageUndo} onClick={handleUndo}>
          {localize('message.undo', 'Undo')}
        </div>
      )}
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
    <div
      className={desktopStyles.DesktopMessageContainer}
      style={{
        zIndex: controller.zIndex,
      }}
    >
      {controller.items.map((item) => (
        <DesktopMessageItem key={item.id} item={item} controller={controller} />
      ))}
    </div>
  );
};
