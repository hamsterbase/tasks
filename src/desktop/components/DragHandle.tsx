import { desktopStyles } from '@/desktop/theme/main';
import React from 'react';
import { useShouldShowOnDesktopMac } from '../hooks/useShouldShowOnDesktopMac';

export const DragHandle: React.FC = () => {
  const shouldShow = useShouldShowOnDesktopMac();
  if (!shouldShow) {
    return null;
  }
  return (
    <div>
      <div
        className={desktopStyles.DragHandleContainer}
        style={
          {
            WebkitAppRegion: 'drag',
            cursor: 'move',
            height: 44,
          } as React.CSSProperties
        }
      />
    </div>
  );
};
