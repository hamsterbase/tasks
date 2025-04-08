import { useRef } from 'react';

export const useLongPress = (callback: () => void, delay: number = 1500) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (callback) {
      longPressTimer.current = setTimeout(() => {
        callback();
      }, delay);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleTouchEnd();
    if (callback) {
      callback();
    }
  };

  return {
    longPressEvents: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchMove: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
      onMouseDown: handleTouchStart,
      onMouseUp: handleTouchEnd,
      onContextMenu: handleContextMenu,
    },
  };
};
