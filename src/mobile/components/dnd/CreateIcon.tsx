import React from 'react';
import { DragDropElements } from '@/utils/dnd/dragDropCollision.ts';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { PlusIcon } from '@/components/icons';
import classNames from 'classnames';
import { styles } from '@/mobile/theme';

export interface ICreateIconProps {
  onClick: () => void;
}

export const CreateIcon: React.FC<ICreateIconProps> = (props: ICreateIconProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: DragDropElements.create,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging && transform && transform.y !== 0) {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          ...style,
          position: 'fixed',
          left: '50%',
          transform: `translateX(-50%) ${CSS.Transform.toString(transform)}`,
          width: 'calc(100vw - 1.5rem)',
        }}
      >
        <div
          className={classNames(styles.taskItemDraggingRound, styles.taskItemHeight, styles.listItemDraggedBackground)}
        />
      </div>
    );
  }
  if (isDragging) {
    return null;
  }

  return (
    <button
      onClick={() => {
        props.onClick();
      }}
      data-id={DragDropElements.create}
      ref={setNodeRef}
      className={classNames(styles.fabButton, 'bg-brand')}
      style={style}
      {...listeners}
      {...attributes}
    >
      <PlusIcon size={20} />
    </button>
  );
};
