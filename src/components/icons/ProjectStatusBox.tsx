import { CancelIcon, CheckIcon } from '@/components/icons/index.ts';
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
  border = 'border-2',
}) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const rotation = -90;

  const hasSize = className?.includes('size') || (className?.includes('w-') && className?.includes('h-'));

  const { longPressEvents } = useLongPress(() => {
    if (onLongPress) {
      onLongPress();
    }
  });

  const getProgressPath = () => {
    if (normalizedProgress === 0) return '';
    // 35 / 50 = 0.7
    const radius = 40;
    if (normalizedProgress === 1) {
      return `M 50 50 m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
    }

    const endAngle = rotation + normalizedProgress * 360;
    const largeArcFlag = endAngle - rotation <= 180 ? 0 : 1;
    return `
      M 50 50
      L ${50 + radius * Math.cos((rotation * Math.PI) / 180)} ${50 + radius * Math.sin((rotation * Math.PI) / 180)}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 
      ${50 + radius * Math.cos((endAngle * Math.PI) / 180)} ${50 + radius * Math.sin((endAngle * Math.PI) / 180)}
      Z
    `;
  };

  return (
    <div
      className={classNames('flex items-center justify-center relative', className, {
        'size-full': !hasSize,
      })}
    >
      <div
        onClick={onClick}
        {...longPressEvents}
        className={classNames('flex items-center justify-center rounded-full size-[90%] box-border', {
          'border-brand fill-brand text-brand': color === 'brand',
          'border-t3 fill-t3 text-t3': color === 't3',
          'border-t1 fill-t1 text-t1': color === 't1',
          'border-t2 fill-t2 text-t2': color === 't2',
          'border-white fill-white text-white': color === 'white',
          [border]: true,
        })}
      >
        {status !== 'completed' && status !== 'canceled' && normalizedProgress > 0 && (
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <path d={getProgressPath()} />
          </svg>
        )}
        {status === 'completed' && <CheckIcon className="size-full" />}
        {status === 'canceled' && <CancelIcon className="size-full" />}
      </div>
    </div>
  );
};
