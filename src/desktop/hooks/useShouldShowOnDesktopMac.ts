import { useState, useEffect } from 'react';
import { checkPlatform } from '../../base/browser/checkPlatform';

export function useShouldShowOnDesktopMac() {
  const [fullscreen, setFullscreen] = useState(false);
  const { isElectron, isMac } = checkPlatform();

  useEffect(() => {
    if (isElectron && isMac && window.electronAPI) {
      const electronAPI = window.electronAPI;
      const checkFullscreen = async () => {
        try {
          const isFullScreen = await electronAPI.isFullscreen();
          setFullscreen(isFullScreen);
        } catch {
          setFullscreen(false);
        }
      };

      checkFullscreen();

      const handleFullscreenChange = () => {
        checkFullscreen();
      };

      window.addEventListener('resize', handleFullscreenChange);
      return () => {
        window.removeEventListener('resize', handleFullscreenChange);
      };
    }
  }, [isElectron, isMac]);

  const shouldShow = !fullscreen && isElectron && isMac;

  return shouldShow;
}
