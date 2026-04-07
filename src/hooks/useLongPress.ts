import { useRef } from 'react';

const MOVE_TOLERANCE = 10;

export const useLongPress = (callback: () => void, delay: number = 1000) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const clearTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    isLongPress.current = false;

    if ('touches' in e && e.touches.length > 0) {
      startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if ('clientX' in e) {
      startPos.current = { x: e.clientX, y: e.clientY };
    }

    if (callback) {
      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true;
        callback();
      }, delay);
    }
  };

  const handleTouchEnd = () => {
    clearTimer();
    startPos.current = null;
  };

  const handleTouchCancel = () => {
    clearTimer();
    startPos.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startPos.current || !longPressTimer.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startPos.current.x;
    const dy = touch.clientY - startPos.current.y;
    if (dx * dx + dy * dy > MOVE_TOLERANCE * MOVE_TOLERANCE) {
      console.log('Touch: clear timer due to movement', dx, dy);
      clearTimer();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearTimer();
    if (callback) {
      callback();
    }
  };

  return {
    isLongPress: isLongPress,
    longPressEvents: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchMove: handleTouchMove,
      onTouchCancel: handleTouchCancel,
      onMouseDown: handleTouchStart,
      onMouseUp: handleTouchEnd,
      onContextMenu: handleContextMenu,
    },
  };
};
