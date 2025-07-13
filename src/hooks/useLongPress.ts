import { useRef } from 'react';

export const useLongPress = (callback: () => void, delay: number = 1500) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    isLongPress.current = false;
    if (callback) {
      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true;
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
    isLongPress: isLongPress,
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
