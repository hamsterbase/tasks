import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import React, { useEffect, useState } from 'react';
import { ToastController } from './ToastController';
import classNames from 'classnames';

export const Toast: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const toastController: ToastController | null = workbenchOverlayService.getOverlay(OverlayEnum.toast);
  useWatchEvent(toastController?.onStatusChange);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toastController) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [toastController]);

  if (!toastController) return null;

  const toastMessage = (
    <div
      data-testid="overlay-toast"
      className={classNames(
        'fixed left-1/2',
        'bg-toast-bg text-white rounded-md max-w-70 px-3 py-2 text-center text-sm w-max',
        'transition-opacity duration-300 ease-in-out',
        {
          'mt-48 top-0': toastController.position === 'top',
          'top-1/2': toastController.position === 'center',
        },
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      style={{
        pointerEvents: 'none',
        zIndex: toastController.zIndex,
        transform: toastController.position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
      }}
    >
      {toastController.message}
    </div>
  );
  if (toastController.forbidClick) {
    return (
      <div
        data-testid="overlay-toast"
        className={classNames('fixed inset-0 flex items-center justify-center')}
        style={{
          zIndex: toastController.zIndex,
        }}
      >
        {toastMessage}
      </div>
    );
  }
  return toastMessage;
};
