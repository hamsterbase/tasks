import { FlattenedResult } from '@/core/state/home/flattenedItemsToResult.ts';
import { ItemPosition } from '@/core/type';
import type { TreeID } from 'loro-crdt';
import { DragDropElements } from './dragDropCollision';

export type FlattenedItemsDragEndPosition =
  | {
      type: 'createItem';
      position: ItemPosition;
    }
  | {
      type: 'moveItem';
      activeId: TreeID;
      position: ItemPosition;
    }
  | {
      type: 'moveHeader';
      activeId: TreeID;
      position: ItemPosition;
    };

function getItemPosition(overId: string, flattenedItemsResult: FlattenedResult): ItemPosition | undefined {
  const { flattenedItems, flattenedItemMap, rootId, lastNormalItemIndex } = flattenedItemsResult;
  if (overId === DragDropElements.lastPlacement) {
    if (flattenedItemsResult.flattenedItems.length === 2 || lastNormalItemIndex === -1) {
      return {
        type: 'firstElement',
        parentId: flattenedItemsResult.rootId,
      };
    } else {
      const last = flattenedItems[lastNormalItemIndex];
      if (last.type === 'item') {
        return {
          type: 'afterElement',
          previousElementId: last.id,
        };
      } else if (last.type === 'header') {
        return {
          type: 'firstElement',
          parentId: last.id,
        };
      }
    }
  } else {
    const item = flattenedItemMap.get(overId as TreeID)!;
    const itemIndex = item.index;
    if (item.type === 'item') {
      return {
        type: 'beforeElement',
        nextElementId: item.id,
      };
    } else {
      if (itemIndex === 0) {
        return {
          type: 'firstElement',
          parentId: rootId,
        };
      } else {
        const previous = flattenedItems[itemIndex - 1];
        if (previous.type === 'item') {
          return {
            type: 'afterElement',
            previousElementId: previous.id,
          };
        } else if (previous.type === 'header') {
          return {
            type: 'firstElement',
            parentId: previous.id,
          };
        }
      }
    }
  }
}

function getItemMovePositionForHeader(
  activeId: TreeID,
  overId: TreeID,
  flattenedItemsResult: FlattenedResult
): ItemPosition {
  const overIndex = flattenedItemsResult.flattenedItemMap.get(overId)!.index;
  const activeIndex = flattenedItemsResult.flattenedItemMap.get(activeId)!.index;
  const overItem = flattenedItemsResult.flattenedItemMap.get(overId)!;
  const overHeaderId = overItem.type === 'item' ? overItem.headerId! : (overItem.id as TreeID);
  if (overIndex > activeIndex) {
    return {
      type: 'afterElement',
      previousElementId: overHeaderId,
    };
  } else {
    return {
      type: 'beforeElement',
      nextElementId: overHeaderId,
    };
  }
}

function getItemMovePosition(activeId: TreeID, overId: TreeID, flattenedItemsResult: FlattenedResult): ItemPosition {
  if (overId === DragDropElements.futureProjects) {
    const index = flattenedItemsResult.flattenedItemMap.get(overId)!.index;
    if (index === 0) {
      return {
        type: 'firstElement',
        parentId: flattenedItemsResult.rootId,
      };
    }
    const previousHeaderId = flattenedItemsResult.flattenedItems[index - 1].id as TreeID;
    return {
      type: 'afterElement',
      previousElementId: previousHeaderId,
    };
  }
  const overIndex = flattenedItemsResult.flattenedItemMap.get(overId)!.index;
  const activeIndex = flattenedItemsResult.flattenedItemMap.get(activeId)!.index;
  const overItem = flattenedItemsResult.flattenedItemMap.get(overId)!;
  if (overIndex > activeIndex) {
    if (overItem.type === 'item') {
      return {
        type: 'afterElement',
        previousElementId: overId,
      };
    } else {
      return {
        type: 'firstElement',
        parentId: overId,
      };
    }
  } else {
    if (overItem.type === 'item') {
      return {
        type: 'beforeElement',
        nextElementId: overId,
      };
    } else {
      const previousItem = flattenedItemsResult.flattenedItems[overIndex - 1];
      if (!previousItem) {
        return {
          type: 'firstElement',
          parentId: flattenedItemsResult.rootId,
        };
      }
      if (previousItem.type === 'item') {
        return {
          type: 'afterElement',
          previousElementId: previousItem.id,
        };
      } else if (previousItem.type === 'header') {
        return {
          type: 'firstElement',
          parentId: previousItem.id,
        };
      } else {
        return {
          type: 'firstElement',
          parentId: flattenedItemsResult.rootId,
        };
      }
    }
  }
}

export function getFlattenedItemsDragEndPosition(
  activeId: string,
  overId: string,
  flattenedItemsResult: FlattenedResult
): FlattenedItemsDragEndPosition | null {
  if (!flattenedItemsResult.isFlattenedItem(overId) || !flattenedItemsResult.isFlattenedItem(activeId)) {
    return null;
  }
  if (!flattenedItemsResult.isIgnore(activeId, overId)) {
    throw new Error('ignore');
  }
  if (activeId === DragDropElements.create) {
    if (flattenedItemsResult.isFlattenedItem(overId)) {
      const position = getItemPosition(overId, flattenedItemsResult);
      if (position) {
        return {
          type: 'createItem',
          position,
        };
      }
    }
  }
  if (flattenedItemsResult.isItem(activeId)) {
    return {
      type: 'moveItem',
      activeId,
      position: getItemMovePosition(activeId, overId as TreeID, flattenedItemsResult),
    };
  } else {
    return {
      type: 'moveHeader',
      activeId,
      position: getItemMovePositionForHeader(activeId, overId as TreeID, flattenedItemsResult),
    };
  }
}
