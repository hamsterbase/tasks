import { ItemStatus } from '@/core/type';
import { desktopStyles } from '@/desktop/theme/main';
import classNames from 'classnames';
import React from 'react';

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
}

export const ProjectIcon: React.FC<ProjectIconProps> = ({
  status = 'created',
  progress = 0,
  size = 'md',
  className,
}) => {
  const pixelSize = sizeMap[size];
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const effectiveStatus = status === 'canceled' ? 'cancelled' : status;
  const center = pixelSize / 2;
  const radius = (pixelSize - 2) / 2;
  const innerRadius = radius - 2;
  const iconOffset = radius * 0.4;

  const checkmarkPath = `M ${center - iconOffset} ${center} L ${center - iconOffset * 0.2} ${
    center + iconOffset * 0.6
  } L ${center + iconOffset} ${center - iconOffset * 0.5}`;

  const arcPath = (() => {
    const angle = normalizedProgress * 360;
    const startRad = -Math.PI / 2;
    const endRad = (-90 + angle) * (Math.PI / 180);
    const x1 = center + innerRadius * Math.cos(startRad);
    const y1 = center + innerRadius * Math.sin(startRad);
    const x2 = center + innerRadius * Math.cos(endRad);
    const y2 = center + innerRadius * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${center} ${center} L ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  })();

  return (
    <span
      className={classNames(desktopStyles.ProjectIconContainer, className)}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox={`0 0 ${pixelSize} ${pixelSize}`}
        aria-hidden="true"
        className={desktopStyles.ProjectIconSvg}
      >
        <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth="1" />
        {effectiveStatus === 'created' && normalizedProgress > 0 && normalizedProgress < 1 && (
          <path d={arcPath} fill="currentColor" />
        )}
        {effectiveStatus === 'created' && normalizedProgress >= 1 && (
          <circle cx={center} cy={center} r={innerRadius} fill="currentColor" />
        )}
        {effectiveStatus === 'completed' && (
          <path
            d={checkmarkPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {effectiveStatus === 'cancelled' && (
          <g>
            <line
              x1={center - iconOffset}
              y1={center - iconOffset}
              x2={center + iconOffset}
              y2={center + iconOffset}
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            <line
              x1={center + iconOffset}
              y1={center - iconOffset}
              x2={center - iconOffset}
              y2={center + iconOffset}
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </span>
  );
};
