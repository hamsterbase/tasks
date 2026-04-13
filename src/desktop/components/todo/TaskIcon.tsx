import classNames from 'classnames';
import React from 'react';

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
}

export const TaskIcon: React.FC<TaskIconProps> = ({ status, size = 'md', className }) => {
  const isCompleted = status === 'completed';
  const isCanceled = status === 'canceled' || status === 'cancelled';
  const pixelSize = sizeMap[size];
  const radius = Math.max(3, Math.round(pixelSize * 0.28));
  const checkmarkPath = `M ${pixelSize * 0.25} ${pixelSize * 0.5} L ${pixelSize * 0.45} ${pixelSize * 0.7} L ${pixelSize * 0.75} ${pixelSize * 0.35}`;
  const crossInset = pixelSize * 0.3;
  const crossPath = `M ${crossInset} ${crossInset} L ${pixelSize - crossInset} ${pixelSize - crossInset} M ${pixelSize - crossInset} ${crossInset} L ${crossInset} ${pixelSize - crossInset}`;

  return (
    <span
      className={classNames('inline-flex items-center justify-center text-t3 shrink-0', className)}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox={`0 0 ${pixelSize} ${pixelSize}`}
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width={pixelSize - 2}
          height={pixelSize - 2}
          rx={radius}
          ry={radius}
          stroke="currentColor"
          strokeWidth="1"
        />
        {isCompleted && (
          <path
            d={checkmarkPath}
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {isCanceled && (
          <path d={crossPath} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </span>
  );
};
