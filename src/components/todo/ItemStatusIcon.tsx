import { CancelIcon, CheckIcon } from '@/components/icons';
import { ItemShape, ItemStatusAnimationPhase } from '@/components/todo/itemStatusVisual';
import { ItemStatus } from '@/core/type';
import classNames from 'classnames';
import React from 'react';

interface ItemStatusIconProps {
  shape: ItemShape;
  status: ItemStatus | 'pending' | 'cancelled';
  size: number;
  animationPhase?: ItemStatusAnimationPhase;
  className?: string;
  borderWidth?: number;
  markStrokeWidth?: number;
}

export const ItemStatusIcon: React.FC<ItemStatusIconProps> = ({
  shape,
  status,
  size,
  animationPhase = 'idle',
  className,
  borderWidth = 1.5,
  markStrokeWidth = 1.5,
}) => {
  const normalizedStatus: ItemStatus = status === 'cancelled' ? 'canceled' : status === 'pending' ? 'created' : status;
  const showCheck = normalizedStatus === 'completed' || animationPhase === 'reverting';
  const showCancel = normalizedStatus === 'canceled';

  return (
    <span
      aria-hidden="true"
      className={classNames('item-status-icon', className)}
      data-animation-phase={animationPhase}
      data-shape={shape}
      data-status={normalizedStatus}
      style={
        {
          width: size,
          height: size,
          '--item-status-border-width': `${borderWidth}px`,
          '--item-status-mark-stroke-width': markStrokeWidth,
        } as React.CSSProperties
      }
    >
      {showCheck && (
        <CheckIcon className="item-status-icon-mark item-status-icon-check" strokeWidth={markStrokeWidth} />
      )}
      {showCancel && <CancelIcon className="item-status-icon-mark" strokeWidth={markStrokeWidth} />}
    </span>
  );
};
