import classNames from 'classnames';
import React, { useMemo } from 'react';
import { ItemStatus } from '@/core/type.ts';
import { useLongPress } from '@/hooks/useLongPress.ts';

type CheckboxSize = 'medium' | 'large';

interface ProjectCheckboxProps {
  size?: CheckboxSize;
  status?: ItemStatus;
  progress?: number;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
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
    touch: 7 * rate, // size-7 = 1.75rem
  },
} as const;

export const MobileProjectCheckbox: React.FC<ProjectCheckboxProps> = ({
  size = 'medium',
  status = 'created',
  progress = 0,
  onClick,
  onLongPress,
  className,
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const visualSize = sizeConfig.visual;
  const touchSize = sizeConfig.touch;
  const center = visualSize / 2;
  const radius = (visualSize - 2) / 2; // Account for stroke width
  const innerRadius = radius - 2; // Smaller radius for the filled arc
  const iconOffset = radius * 0.4; // Offset for X and checkmark icons

  const { longPressEvents } = useLongPress(() => {
    if (onLongPress) {
      onLongPress();
    }
  });

  // Checkmark path: starts from bottom-left, goes to bottom-center, then to top-right
  const checkmarkPath = useMemo(() => {
    const c = center;
    const offset = iconOffset;
    // Checkmark points: left-bottom → center-bottom → right-top
    const x1 = c - offset;
    const y1 = c;
    const x2 = c - offset * 0.2;
    const y2 = c + offset * 0.6;
    const x3 = c + offset;
    const y3 = c - offset * 0.5;
    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`;
  }, [center, iconOffset]);

  const arcPath = useMemo(() => {
    const angle = (progress / 100) * 360;
    const startAngleRad = -90 * (Math.PI / 180); // Start from top (12 o'clock)
    const endAngleRad = (-90 + angle) * (Math.PI / 180);

    const x1 = center + innerRadius * Math.cos(startAngleRad);
    const y1 = center + innerRadius * Math.sin(startAngleRad);
    const x2 = center + innerRadius * Math.cos(endAngleRad);
    const y2 = center + innerRadius * Math.sin(endAngleRad);

    const largeArc = angle > 180 ? 1 : 0;

    // Full circle case
    if (progress >= 100) {
      return `M ${center} ${center - innerRadius} A ${innerRadius} ${innerRadius} 0 1 1 ${center - 0.001} ${center - innerRadius} Z`;
    }

    return `M ${center} ${center} L ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }, [progress, center, innerRadius]);

  return (
    <span
      className={classNames(
        'shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-150',
        className
      )}
      style={{ width: touchSize, height: touchSize }}
      onClick={onClick}
      {...longPressEvents}
    >
      <svg width={visualSize} height={visualSize} viewBox={`0 0 ${visualSize} ${visualSize}`}>
        {/* Outer circle ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={status === 'completed' ? 'var(--color-brand)' : 'none'}
          stroke={status === 'completed' ? 'var(--color-brand)' : 'currentColor'}
          strokeWidth="1.5"
        />
        {/* Filled progress arc (only for created status) */}
        {status === 'created' && progress > 0 && <path d={arcPath} fill="currentColor" />}
        {/* Checkmark for complete status */}
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
        {/* X mark for cancel status */}
        {status === 'canceled' && (
          <g>
            <line
              x1={center - iconOffset}
              y1={center - iconOffset}
              x2={center + iconOffset}
              y2={center + iconOffset}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1={center + iconOffset}
              y1={center - iconOffset}
              x2={center - iconOffset}
              y2={center + iconOffset}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </span>
  );
};
