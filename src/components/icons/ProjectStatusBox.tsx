import { ItemStatus } from '@/core/type.ts';
import { useLongPress } from '@/hooks/useLongPress.ts';
import classNames from 'classnames';
import React from 'react';

interface ProjectStatusBoxProps {
  progress: number;
  status: ItemStatus;
  className?: string;
  onClick?: () => void;
  onLongPress?: () => void;
  color?: 't3' | 'brand' | 't1' | 'white' | 't2';
  border?: string;
}

export const ProjectStatusBox: React.FC<ProjectStatusBoxProps> = ({
  progress,
  status,
  className,
  onClick,
  onLongPress,
  color = 't1',
}) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const isCompleted = status === 'completed';
  const isCanceled = status === 'canceled';
  const rotation = -90;
  const pixelSize = 16;

  const { longPressEvents } = useLongPress(() => {
    if (onLongPress) {
      onLongPress();
    }
  });

  const colorClass = classNames({
    'text-brand': color === 'brand',
    'text-t3': color === 't3',
    'text-t1': color === 't1',
    'text-t2': color === 't2',
    'text-white': color === 'white',
  });

  const getProgressPath = () => {
    if (normalizedProgress === 0) return '';
    const radius = 40;
    const endAngle = rotation + normalizedProgress * 360;
    const x1 = 50 + radius * Math.cos((rotation * Math.PI) / 180);
    const y1 = 50 + radius * Math.sin((rotation * Math.PI) / 180);
    const x2 = 50 + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 50 + radius * Math.sin((endAngle * Math.PI) / 180);
    const largeArc = normalizedProgress * 360 > 180 ? 1 : 0;
    return `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <span
      onClick={onClick}
      {...longPressEvents}
      className={classNames('inline-flex items-center justify-center shrink-0', colorClass, className)}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg width={pixelSize} height={pixelSize} viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" />
        {!isCompleted && !isCanceled && normalizedProgress > 0 && <path d={getProgressPath()} fill="currentColor" />}
        {!isCompleted && !isCanceled && normalizedProgress >= 1 && (
          <circle cx="50" cy="50" r="40" fill="currentColor" />
        )}
        {isCompleted && (
          <path
            d="M 25 50 L 45 70 L 75 35"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {isCanceled && (
          <>
            <line x1="30" y1="30" x2="70" y2="70" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <line x1="70" y1="30" x2="30" y2="70" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          </>
        )}
      </svg>
    </span>
  );
};
