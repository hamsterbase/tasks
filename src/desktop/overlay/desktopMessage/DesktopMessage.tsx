import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React, { useEffect, useState } from 'react';
import { AlertCircleIcon, CheckIcon, CloseIcon, InfoIcon } from '../../../components/icons';
import { useService } from '../../../hooks/use-service';
import { useWatchEvent } from '../../../hooks/use-watch-event';
import { IWorkbenchOverlayService } from '../../../services/overlay/common/WorkbenchOverlayService';
import { DesktopMessageController, MessageType } from './DesktopMessageController';

const MessageIcon: React.FC<{ type: MessageType }> = ({ type }) => {
  const iconMap = {
    success: <CheckIcon size={16} />,
    error: <AlertCircleIcon size={16} />,
    info: <InfoIcon size={16} />,
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

  const getTypeStyles = (type: MessageType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--color-success-green)',
          border: 'var(--color-line-regular)',
          icon: 'var(--color-success-green)',
          text: 'var(--color-t1)',
        };
      case 'error':
        return {
          bg: 'var(--color-stress-red)',
          border: 'var(--color-line-regular)',
          icon: 'var(--color-stress-red)',
          text: 'var(--color-t1)',
        };
      case 'info':
        return {
          bg: 'var(--color-brand)',
          border: 'var(--color-line-regular)',
          icon: 'var(--color-brand)',
          text: 'var(--color-t1)',
        };
    }
  };

  const styles = getTypeStyles(controller.type);

  return (
    <div
      className="fixed top-6 right-6 flex flex-col items-end pointer-events-none"
      style={{
        zIndex: controller.zIndex,
      }}
    >
      <div
        className={`
          border rounded-lg shadow-lg backdrop-blur-sm
          min-w-80 max-w-md p-4 pointer-events-auto
          transform transition-all duration-200 ease-out
          ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
        style={{
          backgroundColor: 'var(--color-bg1)',
          borderColor: styles.border,
          color: styles.text,
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5" style={{ color: styles.icon }}>
            <MessageIcon type={controller.type} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-5 break-words">{controller.message}</p>
          </div>

          <button
            onClick={handleClose}
            className="hover:opacity-70 transition-opacity flex-shrink-0 ml-2"
            style={{ color: styles.icon }}
          >
            <CloseIcon size={14} />
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
