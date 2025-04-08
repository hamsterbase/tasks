import { useSortable } from '@dnd-kit/sortable';
import { DragDropElements } from '@/utils/dnd/dragDropCollision.ts';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

export const LastPlacement = () => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: DragDropElements.lastPlacement,
    disabled: true,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="h-10 rounded opacity-0" style={{ width: 300 }} />
    </div>
  );
};
