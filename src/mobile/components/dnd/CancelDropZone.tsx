import React from 'react';
import { DragDropElements } from '@/utils/dnd/dragDropCollision.ts';
import { useDroppable } from '@dnd-kit/core';
import { useDndContext } from '@dnd-kit/core';
import { CloseIcon } from '@/components/icons';
import classNames from 'classnames';
import { styles } from '@/mobile/theme';

export const CancelDropZone = () => {
  const dndContext = useDndContext();
  const { setNodeRef, isOver } = useDroppable({
    id: DragDropElements.cancel,
  });
  if (dndContext.active?.id !== DragDropElements.create) {
    return null;
  }
  return (
    <div
      ref={setNodeRef}
      className={classNames(styles.fabButton, isOver ? 'opacity-100' : 'opacity-40', 'bg-accent-danger')}
    >
      <CloseIcon size={20} />
    </div>
  );
};
