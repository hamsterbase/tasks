import { ItemMovePosition, ItemPosition } from '@/core/type';
import type { TreeID } from 'loro-crdt';
import { DragDropElements } from './dragDropCollision';

type DragDropAction =
  | {
      type: 'create';
      position: ItemPosition;
    }
  | {
      type: 'move';
      position: ItemMovePosition;
    };

export function calculateDragDropAction(
  overId: string,
  activeId: string,
  itemList: TreeID[],
  rootId?: TreeID
): DragDropAction | null {
  if (activeId === DragDropElements.create) {
    const overTask = itemList.find((task) => task === overId);
    if (overTask) {
      return {
        type: 'create',
        position: {
          type: 'beforeElement',
          nextElementId: overId as TreeID,
        } as ItemPosition,
      };
    } else {
      if (overId !== DragDropElements.lastPlacement) {
        return null;
      }
      if (itemList.length > 0) {
        return {
          type: 'create',
          position: {
            type: 'afterElement',
            previousElementId: itemList[itemList.length - 1],
          } as ItemPosition,
        };
      } else {
        return {
          type: 'create',
          position: {
            type: 'firstElement',
            parentId: rootId,
          } as ItemPosition,
        };
      }
    }
  } else {
    const overIndex = itemList.findIndex((task) => task === overId);
    const activeIndex = itemList.findIndex((task) => task === activeId);
    if (overIndex > activeIndex) {
      return {
        type: 'move',
        position: {
          type: 'afterElement',
          previousElementId: overId,
        } as ItemMovePosition,
      };
    } else {
      return {
        type: 'move',
        position: {
          type: 'beforeElement',
          nextElementId: overId,
        } as ItemMovePosition,
      };
    }
  }
}
