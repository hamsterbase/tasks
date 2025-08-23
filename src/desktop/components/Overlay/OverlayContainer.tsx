import { desktopStyles } from '@/desktop/theme/main';
import classNames from 'classnames';
import React, { useLayoutEffect, useRef, useState } from 'react';

interface OverlayFilterOption {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  disposeWhenBlur?: boolean;
}

interface OverlayContainerProps {
  zIndex: number;
  onDispose: () => void;
  left: number;
  top: number;
  children: React.ReactNode;
  className?: string;
  filter?: OverlayFilterOption;
}

export const OverlayContainer: React.FC<OverlayContainerProps> = ({
  zIndex,
  onDispose,
  left,
  top,
  children,
  className,
  filter,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left, top });

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Get container dimensions
    const rect = containerRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate adjusted position
    let adjustedLeft = left;
    let adjustedTop = top;

    // Adjust horizontal position if container overflows viewport
    if (left + containerWidth > viewportWidth) {
      // Try to position to the left of the trigger point
      adjustedLeft = Math.max(8, viewportWidth - containerWidth - 8);
    }
    if (adjustedLeft < 8) {
      adjustedLeft = 8;
    }

    // Adjust vertical position if container overflows viewport
    if (top + containerHeight > viewportHeight) {
      // Try to position above the trigger point
      adjustedTop = Math.max(8, viewportHeight - containerHeight - 8);
    }
    if (adjustedTop < 8) {
      adjustedTop = 8;
    }

    // Update position if it changed
    if (adjustedLeft !== left || adjustedTop !== top) {
      setPosition({ left: adjustedLeft, top: adjustedTop });
    }
  }, [left, top]);

  return (
    <>
      <div className={desktopStyles.OverlayContainerBackdrop} style={{ zIndex: zIndex - 1 }} onClick={onDispose} />
      <div
        ref={containerRef}
        className={classNames(desktopStyles.OverlayContainerContent, className)}
        style={{
          zIndex,
          left: position.left,
          top: position.top,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {filter && (
          <div className={desktopStyles.OverlayContainerFilterWrapper}>
            <input
              type="text"
              value={filter.value}
              onBlur={() => {
                if (filter.disposeWhenBlur) {
                  onDispose();
                }
              }}
              onChange={(e) => filter.onChange(e.target.value)}
              placeholder={filter.placeholder}
              autoFocus={filter.autoFocus}
            />
          </div>
        )}
        <div>{children}</div>
      </div>
    </>
  );
};
