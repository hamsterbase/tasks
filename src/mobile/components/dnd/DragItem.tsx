import { styles } from '@/mobile/theme';
import { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import classNames from 'classnames';
import React from 'react';

interface DragItemProps {
  attributes: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  style?: React.CSSProperties;
}

export const DragItem = React.forwardRef<HTMLDivElement, DragItemProps>((props, ref) => {
  return (
    <div
      ref={ref}
      {...props.attributes}
      {...props.listeners}
      style={props.style}
      className={classNames(
        'w-full',
        styles.listItemRound,
        styles.taskItemHeight,
        styles.listItemDraggedBackground,
        styles.taskItemDraggingRound
      )}
    ></div>
  );
});
