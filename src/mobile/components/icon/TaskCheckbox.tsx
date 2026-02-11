import classNames from 'classnames';
import React, { useMemo } from 'react';

type CheckboxSize = 'small' | 'medium';
type CheckboxStatus = 'unchecked' | 'completed' | 'cancelled';

interface TaskCheckboxProps {
  size?: CheckboxSize;
  status?: CheckboxStatus;
  onClick?: () => void;
  className?: string;
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
  status = 'unchecked',
  onClick,
  className,
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const visualSize = sizeConfig.visual;
  const touchSize = sizeConfig.touch;
  const borderRadius = sizeConfig.radius;

  const checkmarkPath = useMemo(() => {
    const s = visualSize;
    const startX = s * 0.25;
    const startY = s * 0.5;
    const midX = s * 0.45;
    const midY = s * 0.7;
    const endX = s * 0.75;
    const endY = s * 0.35;
    return `M ${startX} ${startY} L ${midX} ${midY} L ${endX} ${endY}`;
  }, [visualSize]);

  const crossPath = useMemo(() => {
    const s = visualSize;
    const padding = s * 0.3;
    return `M ${padding} ${padding} L ${s - padding} ${s - padding} M ${s - padding} ${padding} L ${padding} ${s - padding}`;
  }, [visualSize]);

  return (
    <span
      className={classNames(
        'shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-150',
        className
      )}
      style={{ width: touchSize, height: touchSize }}
      onClick={onClick}
    >
      <svg width={visualSize} height={visualSize} viewBox={`0 0 ${visualSize} ${visualSize}`}>
        {/* Background rect */}
        <rect
          x="1"
          y="1"
          width={visualSize - 2}
          height={visualSize - 2}
          rx={borderRadius}
          ry={borderRadius}
          fill={status === 'completed' ? 'var(--color-brand)' : 'transparent'}
          stroke={status === 'completed' ? 'var(--color-brand)' : 'currentColor'}
          strokeWidth="1.5"
        />
        {/* Checkmark for completed */}
        {status === 'completed' && (
          <path
            d={checkmarkPath}
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* X mark for cancelled */}
        {status === 'cancelled' && (
          <path
            d={crossPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </span>
  );
};
