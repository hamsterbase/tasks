import { CancelIcon, CheckIcon } from '@/components/icons';
import { ItemStatus } from '@/core/type.ts';
import classNames from 'classnames';
import React from 'react';

interface ProjectStatusIconProps {
  progress: number;
  status: ItemStatus;
  isActive?: boolean;
}

export const ProjectStatusIcon: React.FC<ProjectStatusIconProps> = ({ progress, status, isActive = false }) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const rotation = -90;

  const getProgressPath = () => {
    if (normalizedProgress === 0) return '';
    const radius = 8; // Smaller radius for sidebar
    if (normalizedProgress === 1) {
      return `M 12 12 m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
    }

    const endAngle = rotation + normalizedProgress * 360;
    const largeArcFlag = endAngle - rotation <= 180 ? 0 : 1;
    return `
      M 12 12
      L ${12 + radius * Math.cos((rotation * Math.PI) / 180)} ${12 + radius * Math.sin((rotation * Math.PI) / 180)}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 
      ${12 + radius * Math.cos((endAngle * Math.PI) / 180)} ${12 + radius * Math.sin((endAngle * Math.PI) / 180)}
      Z
    `;
  };

  if (status === 'completed') {
    return (
      <div
        className={classNames('size-3 flex items-center justify-center rounded-full', {
          'bg-white text-bg1': isActive,
          'bg-brand text-white': !isActive,
        })}
      >
        <CheckIcon className="size-4" />
      </div>
    );
  }

  if (status === 'canceled') {
    return (
      <div
        className={classNames('size-3 flex items-center justify-center rounded-full', {
          'bg-white text-bg1': isActive,
          'bg-t3 text-white': !isActive,
        })}
      >
        <CancelIcon className="size-4" />
      </div>
    );
  }

  // For active and in-progress projects
  return (
    <div className="size-4 flex items-center justify-center relative">
      <div
        className={classNames('size-4 rounded-full border transition-colors', {
          'border-white bg-transparent': isActive,
          'border-current bg-transparent': !isActive,
        })}
      />
      {normalizedProgress > 0 && (
        <svg className="absolute size-4" viewBox="0 0 24 24">
          <path
            d={getProgressPath()}
            className={classNames('transition-colors', {
              'fill-bg1': isActive,
              'fill-current': !isActive,
            })}
          />
        </svg>
      )}
    </div>
  );
};
