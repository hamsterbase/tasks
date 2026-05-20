import type { TreeID } from 'loro-crdt';
import { ItemMovePosition } from '@/core/type';
import { GroupedTodayItems, TodayGroup, TodayGroupItem } from './groupTodayItems';

export type TodayGroupDragAction =
  | { kind: 'reorder'; position: ItemMovePosition }
  | { kind: 'moveTask'; parentId: TreeID | null; position: ItemMovePosition }
  | { kind: 'moveProject'; areaId: TreeID | null; position: ItemMovePosition };

function itemId(item: TodayGroupItem): string {
  return item.type === 'task' ? item.task.id : item.project.id;
}

function findContainingGroup(grouped: GroupedTodayItems, id: string): TodayGroup | undefined {
  return grouped.groups.find((group) => group.items.some((item) => itemId(item) === id));
}

function findGroupByHeading(grouped: GroupedTodayItems, id: string): TodayGroup | undefined {
  return grouped.groups.find((group) => group.headingId === id);
}

function isProject(grouped: GroupedTodayItems, id: string): boolean {
  for (const group of grouped.groups) {
    for (const item of group.items) {
      if (itemId(item) === id) {
        return item.type === 'project';
      }
    }
  }
  return false;
}

/**
 * Project a heading-anchored drop position onto a real item, picking the
 * target group as well. The heading itself is not in the date-assigned list,
 * so we can't use it as previous/next for a real move.
 *
 * Strategy:
 * - `afterElement(heading)` (pointer below the heading) → drop INTO this group
 *   at the top: `beforeElement(firstItem)` of `headingGroup`.
 * - `beforeElement(heading)` (pointer above the heading) → drop in the PREVIOUS
 *   non-empty group at the bottom: `afterElement(lastItem)` of that group. If
 *   no previous non-empty group exists, fall back to the heading's group top.
 * - If both the chosen group is empty and no previous fallback applies, return
 *   the raw heading position so the caller can special-case it.
 */
function resolveHeadingDrop(
  grouped: GroupedTodayItems,
  headingGroup: TodayGroup,
  position: ItemMovePosition
): { targetGroup: TodayGroup; position: ItemMovePosition } {
  if (position.type === 'beforeElement') {
    const headingIndex = grouped.groups.indexOf(headingGroup);
    for (let i = headingIndex - 1; i >= 0; i--) {
      const prev = grouped.groups[i];
      if (prev.items.length > 0) {
        const lastId = itemId(prev.items[prev.items.length - 1]) as TreeID;
        return { targetGroup: prev, position: { type: 'afterElement', previousElementId: lastId } };
      }
    }
  }
  if (headingGroup.items.length > 0) {
    const firstId = itemId(headingGroup.items[0]) as TreeID;
    return { targetGroup: headingGroup, position: { type: 'beforeElement', nextElementId: firstId } };
  }
  return { targetGroup: headingGroup, position };
}

/**
 * Resolve a drag inside the grouped Today view into a concrete action.
 *
 * The grouped view mixes tasks and projects in the same flat list, and each
 * group represents a container — noParent (no header), an area, or a project.
 *
 * - Drags within the same group reorder the date-assigned list.
 * - A task dragged into another group is re-parented to that group's container
 *   (project id, area id, or cleared for noParent).
 * - A project dragged into an area or noParent group is re-parented to that
 *   area (or cleared). Projects cannot be dropped into a project group.
 * - A drop on a group heading is interpreted as "into that group at the top".
 *
 * `position` is computed by the caller (the UI uses the drag rects so that the
 * pointer's vertical side relative to the over item decides before/after; the
 * tests use `calculateDragPosition` against the flat id list).
 */
export function getTodayGroupDragAction(
  activeId: string,
  overId: string,
  grouped: GroupedTodayItems,
  position: ItemMovePosition
): TodayGroupDragAction | null {
  if (!activeId || !overId || activeId === overId) {
    return null;
  }

  const activeGroup = findContainingGroup(grouped, activeId);
  if (!activeGroup) {
    return null;
  }

  const headingGroup = findGroupByHeading(grouped, overId);
  let targetGroup: TodayGroup | undefined;
  let resolvedPosition: ItemMovePosition = position;
  if (headingGroup) {
    const resolved = resolveHeadingDrop(grouped, headingGroup, position);
    targetGroup = resolved.targetGroup;
    resolvedPosition = resolved.position;
  } else {
    targetGroup = findContainingGroup(grouped, overId);
  }
  if (!targetGroup) {
    return null;
  }

  const activeIsProject = isProject(grouped, activeId);

  if (activeIsProject) {
    if (targetGroup.kind === 'project') {
      return null;
    }
    if (activeGroup.id === targetGroup.id) {
      return { kind: 'reorder', position: resolvedPosition };
    }
    return { kind: 'moveProject', areaId: targetGroup.parentId, position: resolvedPosition };
  }

  if (activeGroup.id === targetGroup.id) {
    return { kind: 'reorder', position: resolvedPosition };
  }
  return { kind: 'moveTask', parentId: targetGroup.parentId, position: resolvedPosition };
}
