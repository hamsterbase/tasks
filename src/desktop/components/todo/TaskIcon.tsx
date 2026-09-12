import { ItemStatusIcon } from '@/components/todo/ItemStatusIcon';
import { ItemStatusAnimationPhase } from '@/components/todo/itemStatusVisual';
import React from 'react';
import { useItemStatusAnimation } from '@/hooks/useItemStatusAnimation';

type IconSize = 'lg' | 'md' | 'sm' | 'xs';

const sizeMap: Record<IconSize, number> = {
  lg: 18,
  md: 16,
  sm: 14,
  xs: 12,
};

interface TaskIconProps {
  status: string;
  size?: IconSize;
  className?: string;
  animationPhase?: ItemStatusAnimationPhase;
}

export const TaskIcon: React.FC<TaskIconProps> = ({ status, size = 'md', className, animationPhase }) => {
  const pixelSize = sizeMap[size];
  const normalizedStatus = status === 'cancelled' ? 'canceled' : status === 'pending' ? 'created' : status;
  const internalAnimationPhase = useItemStatusAnimation(normalizedStatus as 'created' | 'completed' | 'canceled');
  return (
    <ItemStatusIcon
      shape="task"
      status={status as 'created' | 'completed' | 'canceled' | 'pending' | 'cancelled'}
      size={pixelSize}
      className={className}
      animationPhase={animationPhase ?? internalAnimationPhase}
      borderWidth={1}
      markStrokeWidth={1.25}
    />
  );
};
