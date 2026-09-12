import React from 'react';
import classNames from 'classnames';
import { styles } from '@/mobile/theme';
import {
  ItemStatusAnimationPhase,
  ItemVisualContext,
  getItemStatusVisual,
  itemToneClass,
} from '@/components/todo/itemStatusVisual';
import { ItemStatus } from '@/core/type';

interface TaskItemTitleProps {
  testId?: string;
  title: string;
  status: ItemStatus;
  emptyText: string;
  visualContext?: ItemVisualContext;
  animationPhase?: ItemStatusAnimationPhase;
  className?: string;
}

export const TaskItemTitle: React.FC<TaskItemTitleProps> = ({
  title,
  emptyText,
  status,
  testId,
  visualContext = 'default',
  animationPhase = 'idle',
  className,
}) => {
  const visual = getItemStatusVisual(status, visualContext);
  return (
    <span
      data-testid={testId}
      className={classNames(
        'text-base leading-6 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0',
        title ? itemToneClass(visual.titleTone) : styles.taskItemPlaceholderColor,
        visual.closed && 'item-status-title-closed item-status-title-animated',
        animationPhase === 'reverting' && 'item-status-title-reverting',
        className
      )}
    >
      {title || emptyText}
    </span>
  );
};
