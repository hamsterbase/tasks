import classNames from 'classnames';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { styles } from '../theme';
import { DndContext, MouseSensor, TouchSensor, useDraggable, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { CSS, Transform } from '@dnd-kit/utilities';
import { INavigationService } from '@/services/navigationService/common/navigationService';
import { useService } from '@/hooks/use-service';

export interface ActionSheetProps {
  zIndex: number;
  bottomComponent?: React.ReactNode;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const restrictToDownwardMovement = (transform: Transform | null): Transform | null => {
  if (!transform) return null;
  return {
    ...transform,
    x: 0,
    y: Math.max(0, transform.y),
  };
};

interface ActionSheetContentProps {
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
  onAnimationEnd?: () => void;
  className?: string;
  contentClassName?: string;
}

const ActionSheetContent: React.FC<ActionSheetContentProps> = ({
  children,
  containerRef,
  isVisible,
  onAnimationEnd,
  className,
  contentClassName,
}) => {
  const { setNodeRef, transform, attributes, listeners } = useDraggable({
    id: 'action-sheet',
  });

  const modifiedTransform = restrictToDownwardMovement(transform);

  const style = {
    transform: CSS.Transform.toString(modifiedTransform),
    ...(isVisible ? {} : { transform: 'translateY(100%)' }),
  };

  return (
    <div
      ref={containerRef}
      onTransitionEnd={() => {
        onAnimationEnd?.();
      }}
      style={style}
      className={classNames('absolute left-0 bottom-0 right-0 transition-transform safe-bottom', className, {
        [styles.overlayAnimationDuration]: true,
        [styles.actionSheetRound]: true,
        [styles.actionSheetBackground]: true,
        [styles.actionSheetContentBorder]: true,
      })}
    >
      <div ref={setNodeRef} className="flex items-center justify-center h-5" {...attributes} {...listeners}>
        <div className="w-8 h-0.75 bg-black opacity-20 rounded-full"></div>
      </div>
      <div className={classNames(styles.actionSheetPadding, 'overflow-y-auto', contentClassName)}>{children}</div>
    </div>
  );
};

export const ActionSheet: React.FC<ActionSheetProps> = ({ zIndex, children, onClose, className, contentClassName }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClickBackground = useCallback(() => {
    setIsVisible(false);
  }, []);

  const navigationService = useService(INavigationService);

  useEffect(() => {
    const listener = navigationService.listenBackButton(() => {
      handleClickBackground();
    });
    return () => {
      listener.dispose();
    };
  }, [handleClickBackground, navigationService]);

  const sensors = useSensors(useSensor(TouchSensor), useSensor(MouseSensor));
  const actionSheetRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when ActionSheet is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // Trigger the animation after mounting
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => {
      document.body.style.overflow = originalStyle;
      clearTimeout(timer);
    };
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    const height = actionSheetRef.current?.getBoundingClientRect().height ?? 210;
    if (delta.y > height / 3) {
      handleClickBackground();
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={`fixed inset-0 text-t1`} style={{ zIndex }}>
        <div
          className={classNames(styles.overlayBackground, 'absolute inset-0 transition-opacity', {
            'opacity-0': !isVisible,
            [styles.overlayBackgroundOpacity]: isVisible,
            [styles.overlayAnimationDuration]: true,
          })}
          onClick={handleClickBackground}
        />
        <ActionSheetContent
          className={className}
          contentClassName={contentClassName}
          onAnimationEnd={() => {
            if (!isVisible) {
              onClose?.();
            }
          }}
          containerRef={actionSheetRef}
          isVisible={isVisible}
        >
          {children}
        </ActionSheetContent>
      </div>
    </DndContext>
  );
};
