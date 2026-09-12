import classNames from 'classnames';
import React from 'react';
import { ItemStatus } from '@/core/type.ts';
import { ItemStatusIcon } from '@/components/todo/ItemStatusIcon';
import { ItemStatusAnimationPhase } from '@/components/todo/itemStatusVisual';
import { useItemStatusAnimation } from '@/hooks/useItemStatusAnimation';

type CheckboxSize = 'small' | 'medium';

interface TaskCheckboxProps {
  size?: CheckboxSize;
  status?: ItemStatus;
  onClick?: () => void;
  className?: string;
  animationPhase?: ItemStatusAnimationPhase;
}

function getRemSize() {
  const remSize = getComputedStyle(document.documentElement).fontSize;
  return parseFloat(remSize);
}

const rate = getRemSize() / 16;

const SIZE_CONFIG = {
  small: {
    visual: 4 * 0.25 * rate * 16, // size-4 = 1rem
    touch: 6 * 0.25 * rate * 16, // size-6 = 1.5rem
    radius: 1 * 0.25 * rate * 16, // size-1 = 0.25rem
  },
  medium: {
    visual: 4.5 * 0.25 * rate * 16, // size-4.5 = 1.125rem
    touch: 6 * 0.25 * rate * 16, // size-6 = 1.5rem
    radius: 1.25 * 0.25 * rate * 16, // size-1.25 = 0.3125rem
  },
} as const;

export const TaskCheckbox: React.FC<TaskCheckboxProps> = ({
  size = 'medium',
  status = 'created',
  onClick,
  className,
  animationPhase,
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const internalAnimationPhase = useItemStatusAnimation(status);
  const visualSize = sizeConfig.visual;
  const touchSize = sizeConfig.touch;

  return (
    <span
      className={classNames(
        'shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-150',
        className
      )}
      style={{ width: touchSize, height: touchSize }}
      onClick={onClick}
    >
      <ItemStatusIcon
        shape="task"
        status={status}
        size={visualSize}
        animationPhase={animationPhase ?? internalAnimationPhase}
      />
    </span>
  );
};
