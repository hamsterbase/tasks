import { ItemStatus } from '@/core/type';
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

interface ProjectIconProps {
  status?: ItemStatus | 'cancelled';
  progress?: number;
  size?: IconSize;
  className?: string;
  animationPhase?: ItemStatusAnimationPhase;
}

export const ProjectIcon: React.FC<ProjectIconProps> = ({
  status = 'created',
  progress = 0,
  size = 'md',
  className,
  animationPhase,
}) => {
  const pixelSize = sizeMap[size];
  const internalAnimationPhase = useItemStatusAnimation(status === 'cancelled' ? 'canceled' : status);
  void progress;
  return (
    <ItemStatusIcon
      shape="project"
      status={status}
      size={pixelSize}
      className={className}
      animationPhase={animationPhase ?? internalAnimationPhase}
      borderWidth={1}
      markStrokeWidth={1.25}
    />
  );
};
