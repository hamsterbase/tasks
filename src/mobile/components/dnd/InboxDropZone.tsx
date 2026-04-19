import { InboxIcon } from '@/components/icons';
import { localize } from '@/nls';
import { DragDropElements } from '@/utils/dnd/dragDropCollision.ts';
import { useDndContext, useDroppable } from '@dnd-kit/core';
import classNames from 'classnames';
import React from 'react';
import { styles } from '@/mobile/theme';

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
        styles.inboxDropZone,
        isOver ? styles.inboxDropZoneExpanded : styles.inboxDropZoneCollapsed,
        {
          [styles.inboxDropZoneVisible]: isOver,
          [styles.inboxDropZoneHidden]: !isOver,
        }
      )}
    >
      <InboxIcon size={20} />
      {isOver && <span className={styles.inboxDropZoneLabel}>{localize('inbox.hoverMessage', 'Create Task')}</span>}
    </div>
  );
};
