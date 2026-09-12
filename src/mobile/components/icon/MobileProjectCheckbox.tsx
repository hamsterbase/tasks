import classNames from 'classnames';
import React from 'react';
import { ItemStatus } from '@/core/type.ts';
import { useLongPress } from '@/hooks/useLongPress.ts';
import { ItemStatusIcon } from '@/components/todo/ItemStatusIcon';
import { ItemStatusAnimationPhase } from '@/components/todo/itemStatusVisual';
import { useItemStatusAnimation } from '@/hooks/useItemStatusAnimation';

type CheckboxSize = 'medium' | 'large';

interface ProjectCheckboxProps {
  size?: CheckboxSize;
  status?: ItemStatus;
  progress?: number;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
  animationPhase?: ItemStatusAnimationPhase;
  'data-testid'?: string;
}

function getRemSize() {
  const remSize = getComputedStyle(document.documentElement).fontSize;
  return parseFloat(remSize);
}

const rate = getRemSize() / 4;

const SIZE_CONFIG = {
  medium: {
    visual: 4.5 * rate, // size-4.5 = 1.125rem
    touch: 6 * rate, // size-6 = 1.5rem
  },
  large: {
    visual: 5.5 * rate, // size-5.5 = 1.375rem
    touch: 6 * rate, // size-6 = 1.5rem
  },
} as const;

export const MobileProjectCheckbox: React.FC<ProjectCheckboxProps> = ({
  size = 'medium',
  status = 'created',
  progress = 0,
  onClick,
  onLongPress,
  className,
  animationPhase,
  'data-testid': dataTestId,
}) => {
  void progress;
  const sizeConfig = SIZE_CONFIG[size];
  const internalAnimationPhase = useItemStatusAnimation(status);
  const visualSize = sizeConfig.visual;
  const touchSize = sizeConfig.touch;

  const { longPressEvents } = useLongPress(() => {
    if (onLongPress) {
      onLongPress();
    }
  });

  return (
    <span
      className={classNames(
        'shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-150',
        className
      )}
      style={{ width: touchSize, height: touchSize }}
      data-testid={dataTestId}
      onClick={onClick}
      {...longPressEvents}
    >
      <ItemStatusIcon
        shape="project"
        status={status}
        size={visualSize}
        animationPhase={animationPhase ?? internalAnimationPhase}
      />
    </span>
  );
};
