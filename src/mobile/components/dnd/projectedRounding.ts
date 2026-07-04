import { FlattenedResult } from '@/core/state/home/flattenedItemsToResult';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { arrayMove } from '@dnd-kit/sortable';

/**
 * Card backgrounds live on each row (not on a group container), so the page
 * base color shows through the slot a lifted row leaves behind. Rounding
 * therefore has to follow the PROJECTED order while dragging (the positions
 * rows are displaced to, arrayMove semantics — matching
 * verticalListSortingStrategy), not the static order. The lifted row leaves
 * its card the moment it floats: its semi-transparent slot is not a card row,
 * so the rows around it re-derive their rounding without it.
 */

function projectOrder(ids: string[], activeId?: string, overId?: string): string[] {
  if (!activeId || !overId || activeId === overId) return ids;
  const from = ids.indexOf(activeId);
  const to = ids.indexOf(overId);
  if (from === -1 || to === -1) return ids;
  return arrayMove(ids, from, to);
}

export interface CardRounding {
  top: Set<string>;
  bottom: Set<string>;
}

/**
 * Rounding for a flat section card (views, area sections, inbox, flat today):
 * the first and last visible rows carry the card's corners.
 */
export function computeSectionRounding(ids: string[], activeId?: string, overId?: string): CardRounding {
  const order = projectOrder(ids, activeId, overId).filter((id) => id !== activeId);
  return {
    top: new Set<string>(order.length ? [order[0]] : []),
    bottom: new Set<string>(order.length ? [order[order.length - 1]] : []),
  };
}

/**
 * Rounding for flattened header+item lists (home, project pages). Headers are
 * card rows themselves: a header always starts a new card and carries its top
 * rounding, and whatever row ends up last in a card carries the bottom
 * rounding. The future-projects row always closes the root card. Rows of the
 * header being dragged are hidden while the drag is active, so they are
 * skipped along with the inert markers.
 */
export function computeFlattenedRounding(
  result: FlattenedResult<unknown, unknown>,
  activeId?: string,
  overId?: string
): CardRounding {
  const ids = result.flattenedItems.map((item): string => item.id);
  const order = projectOrder(ids, activeId, overId);
  const skip = new Set<string>([DragDropElements.lastPlacement, DragDropElements.create]);
  if (activeId) {
    skip.add(activeId);
    if (result.isHeader(activeId)) {
      for (const item of result.flattenedItems) {
        if (item.type === 'item' && item.headerId === activeId) {
          skip.add(item.id);
        }
      }
    }
  }
  const top = new Set<string>();
  const bottom = new Set<string>();
  let lastRow: string | null = null;
  for (const id of order) {
    if (skip.has(id)) continue;
    if (result.isHeader(id)) {
      if (lastRow) bottom.add(lastRow);
      top.add(id);
    } else if (lastRow === null) {
      top.add(id);
    }
    if (id === DragDropElements.futureProjects) {
      bottom.add(id);
    }
    lastRow = id;
  }
  if (lastRow) bottom.add(lastRow);
  return { top, bottom };
}
