import { TreeID } from 'loro-crdt';
import { ItemMovePosition } from '../type';

export function calculateDragPosition(activeId: string, overId: string, idList: string[]): ItemMovePosition | null {
  if (activeId === overId) {
    return null;
  }

  const oldIndex = idList.findIndex((id) => id === activeId);
  const newIndex = idList.findIndex((id) => id === overId);

  if (oldIndex === -1 || newIndex === -1) {
    return null;
  }

  const targetId = idList[newIndex];

  if (newIndex > oldIndex) {
    return {
      type: 'afterElement',
      previousElementId: targetId as TreeID,
    };
  } else {
    return {
      type: 'beforeElement',
      nextElementId: targetId as TreeID,
    };
  }
}
