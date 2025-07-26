import { checkPlatform } from '@/base/browser/checkPlatform';
import React, { useEffect, useState } from 'react';

export const DragHandle: React.FC = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const { isElectron, isMac } = checkPlatform();

  useEffect(() => {
    if (isElectron && isMac && window.electronAPI) {
      // 使用 Electron 的 fullscreen 检测
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

  if (fullscreen || !isElectron || !isMac) {
    return null;
  }
  return <div className="h-7 w-full" style={{ WebkitAppRegion: 'drag', cursor: 'move' } as React.CSSProperties} />;
};
