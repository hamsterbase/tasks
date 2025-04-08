import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import type { TreeID } from 'loro-crdt';

export type HeaderFlattenedItem<H = unknown> = {
  type: 'header';
  content: H;
  id: TreeID;
  index: number;
  items: string[];
};

export type ItemFlattenedItem<I = unknown> = {
  type: 'item';
  content: I;
  id: TreeID;
  headerId?: TreeID;
  index: number;
};

export type SpecialFlattenedItem = {
  type: 'special';
  id: typeof DragDropElements.futureProjects | typeof DragDropElements.create | typeof DragDropElements.lastPlacement;
  index: number;
};

export type FlattenedItem<H = unknown, I = unknown> =
  | HeaderFlattenedItem<H>
  | ItemFlattenedItem<I>
  | SpecialFlattenedItem;

export interface FlattenedResult<H = unknown, I = unknown> {
  flattenedItems: FlattenedItem<H, I>[];
  flattenedItemMap: Map<string, FlattenedItem<H, I>>;
  rootId?: TreeID;

  isItem: (id: string | TreeID) => id is TreeID;
  isHeader: (id: string | TreeID) => id is TreeID;
  isSpecial: (id: string | TreeID) => id is string;

  isFlattenedItem: (id: string | TreeID) => id is TreeID;
  isIgnore: (activeId: string | TreeID, overId: string | TreeID) => boolean;

  borderBottom: (id: string | TreeID) => boolean;
  borderTop: (id: string | TreeID) => boolean;

  lastNormalItemIndex: number;
}

export function flattenedItemsToResult<H = unknown, I = unknown>(
  flattenedItems: FlattenedItem<H, I>[],
  _skipFirstHeader: boolean,
  rootId?: TreeID
): FlattenedResult<H, I> {
  const flattenedItemMap = new Map<string, FlattenedItem<H, I>>();
  flattenedItems.forEach((item) => {
    flattenedItemMap.set(item.id, item);
  });
  const futureProjectItem = flattenedItemMap.get(DragDropElements.futureProjects);
  const afterFutureProjectItemId: string | undefined = futureProjectItem
    ? flattenedItems[futureProjectItem.index + 1]?.id
    : undefined;
  const isItem = (id: string | TreeID): id is TreeID => flattenedItemMap.get(id as TreeID)?.type === 'item';
  const isHeader = (id: string | TreeID): id is TreeID => flattenedItemMap.get(id as TreeID)?.type === 'header';
  const isSpecial = (id: string | TreeID): id is string => flattenedItemMap.get(id as TreeID)?.type === 'special';
  const isItemOrHeader = (id: string | TreeID) => isItem(id) || isHeader(id);
  const isFlattenedItem = (id: string | TreeID): id is TreeID => flattenedItemMap.has(id as TreeID);

  let lastNormalItemIndex = -1;
  for (let i = flattenedItems.length - 1; i >= 0; i--) {
    if (flattenedItems[i].type !== 'special') {
      lastNormalItemIndex = i;
      break;
    }
  }
  function isIgnore(activeId: string | TreeID, overId: string | TreeID): boolean {
    const activeItem = flattenedItemMap.get(activeId as TreeID);
    if (!activeItem) {
      return false;
    }
    const overItem = flattenedItemMap.get(overId as TreeID);
    if (!overItem) {
      return false;
    }
    /**
     * 1. create 可以和除了 futureProjects 后一个元素以外的元素碰撞
     */
    if (activeId === DragDropElements.create) {
      if (futureProjectItem) {
        return overId !== afterFutureProjectItemId;
      }
      return true;
    }
    /**
     *
     */
    if (isItem(activeId)) {
      if (futureProjectItem) {
        if (activeItem.index < futureProjectItem.index) {
          return isItemOrHeader(overId);
        } else {
          if (overId === DragDropElements.lastPlacement || overId === DragDropElements.create) {
            return false;
          }
          return (isFlattenedItem(overId) && overId !== afterFutureProjectItemId) || overId === futureProjectItem.id;
        }
      } else {
        return isItemOrHeader(overId);
      }
    }
    if (isHeader(activeId)) {
      if (overItem.index > activeItem.index) {
        if (overItem.type === 'item') {
          if (!overItem.headerId) {
            return false;
          }
          const parentHeader = flattenedItemMap.get(overItem.headerId as TreeID);
          if (!parentHeader) {
            return false;
          }
          return parentHeader.type === 'header' && parentHeader.items[parentHeader.items.length - 1] === overItem.id;
        }
        if (overItem.type === 'header') {
          return overItem.items.length === 0;
        }
        return false;
      } else {
        return isHeader(overId);
      }
    }
    return false;
  }

  function borderBottom(id: string | TreeID): boolean {
    const item = flattenedItemMap.get(id as TreeID);
    if (!item) {
      return false;
    }
    if (item.type === 'special') {
      return item.id === DragDropElements.futureProjects;
    }
    if (item.type === 'header') {
      return item.items.length === 0;
    }
    if (item.type === 'item') {
      const parent = flattenedItemMap.get(item.headerId as TreeID);
      if (!parent) {
        const isNextFutureProject = flattenedItems[item.index + 1]?.id === DragDropElements.futureProjects;
        if (isNextFutureProject) {
          return false;
        }
        return item.index === lastNormalItemIndex || flattenedItems[item.index + 1]?.type === 'header';
      }
      if (parent.type !== 'header') {
        return false;
      }
      return parent.items[parent.items.length - 1] === item.id;
    }
    return false;
  }

  function borderTop(id: string | TreeID): boolean {
    const item = flattenedItemMap.get(id as TreeID);
    if (!item) {
      return false;
    }
    if (item.type === 'header') {
      return true;
    }
    if (item.index === 0) {
      return true;
    }
    return false;
  }

  return {
    flattenedItems,
    flattenedItemMap,
    borderBottom,
    borderTop,
    rootId,
    isItem,
    isHeader,
    isSpecial,
    isIgnore,
    isFlattenedItem,
    lastNormalItemIndex,
  };
}
