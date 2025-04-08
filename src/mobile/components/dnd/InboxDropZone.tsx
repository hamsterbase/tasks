import { InboxIcon } from '@/components/icons';
import { localize } from '@/nls';
import { DragDropElements } from '@/utils/dnd/dragDropCollision.ts';
import { useDndContext, useDroppable } from '@dnd-kit/core';
import classNames from 'classnames';
import React from 'react';

export const InboxDropZone = () => {
  const dndContext = useDndContext();
  const { setNodeRef, isOver } = useDroppable({
    id: DragDropElements.inbox,
  });
  if (dndContext.active?.id !== DragDropElements.create) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      className={classNames(
        `fixed bottom-20 left-4 h-12 ${
          isOver ? 'w-32' : 'w-12'
        } bg-brand rounded-full flex items-center justify-center text-white transition-all duration-200`,
        {
          'opacity-100': isOver,
          'opacity-60': !isOver,
        }
      )}
    >
      <InboxIcon size={20} />
      {isOver && (
        <span className="ml-1 text-sm whitespace-nowrap">{localize('inbox.hoverMessage', 'Create Task')}</span>
      )}
    </div>
  );
};
