import type { TreeID } from 'loro-crdt';
import type { DragEndEvent } from '@dnd-kit/core';
import { ItemMovePosition } from '@/core/type';

/**
 * Decide whether the active item should land before or after the over item.
 *
 * We prefer dnd-kit Sortable's index data (active vs over index in the same
 * SortableContext) because it captures the user's intent: "active was above
 * the target → drop after target", "active was below → drop before target".
 *
 * Rect-based center comparison is brittle in practice: the translated active
 * rect's center is offset by where the user clicked inside the source row
 * (not the actual pointer), so a small drag onto a neighbour can leave the
 * center on the "wrong" side of the target center and the drop direction
 * flips contrary to the visual intent.
 *
 * Falls back to rect comparison only when sortable index data is missing.
 */
export function getTodayGroupDropPosition(event: DragEndEvent): ItemMovePosition | null {
  const { active, over } = event;
  if (!over) return null;
  if (active.id === over.id) return null;

  const activeSortable = (active.data.current as { sortable?: { index?: number } } | undefined)?.sortable;
  const overSortable = (over.data.current as { sortable?: { index?: number } } | undefined)?.sortable;
  const activeIndex = activeSortable?.index;
  const overIndex = overSortable?.index;
  if (typeof activeIndex === 'number' && typeof overIndex === 'number' && activeIndex !== overIndex) {
    if (activeIndex < overIndex) {
      return { type: 'afterElement', previousElementId: over.id as TreeID };
    }
    return { type: 'beforeElement', nextElementId: over.id as TreeID };
  }

  const activeRect = active.rect.current.translated;
  const overRect = over.rect;
  if (!activeRect || !overRect) return null;

  const activeCenter = activeRect.top + activeRect.height / 2;
  const overCenter = overRect.top + overRect.height / 2;
  if (activeCenter > overCenter) {
    return { type: 'afterElement', previousElementId: over.id as TreeID };
  }
  return { type: 'beforeElement', nextElementId: over.id as TreeID };
}
