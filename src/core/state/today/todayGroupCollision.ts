import { closestCenter, CollisionDetection } from '@dnd-kit/core';
import { cancelCollisionDetection, DragDropElements } from '@/utils/dnd/dragDropCollision';

interface TodayGroupCollisionOptions {
  isProject: (id: string) => boolean;
  isTask: (id: string) => boolean;
  /**
   * Headings are sortable rows that represent a group (area or project). They
   * are valid drop targets — the drag-action resolver interprets a heading
   * drop as "drop into the group at the top".
   */
  isHeading: (id: string) => boolean;
  /**
   * Items (or headings) that belong to a project group. Projects cannot nest
   * under another project, so projects must not collide with these ids.
   */
  isInProjectGroup: (id: string) => boolean;
}

/**
 * Collision detection for the grouped Today view where tasks and projects are
 * rendered in the same flat list:
 *
 * - The FAB ("create") behaves like the legacy strategy: collide with tasks
 *   and with the last-placement marker.
 * - A task can be dragged onto any item or onto any group heading; the heading
 *   case lets users drop into a group via its title row (helpful for empty
 *   groups or boundary regions between groups).
 * - A project can be dragged onto items or headings of area / noParent groups,
 *   but never onto a project group (no nesting) or onto items inside one.
 */
export const todayGroupCollisionDetectionStrategyFactory = (
  options: TodayGroupCollisionOptions
): CollisionDetection => {
  const { isProject, isTask, isHeading, isInProjectGroup } = options;
  return (args) => {
    const cancelCollisions = cancelCollisionDetection(args);
    if (cancelCollisions.length > 0) {
      return cancelCollisions;
    }
    const activeId = args.active.id as string;
    if (activeId === DragDropElements.create) {
      return closestCenter(args).filter(
        (item) => isTask(item.id as string) || item.id === DragDropElements.lastPlacement
      );
    }
    if (isProject(activeId)) {
      return closestCenter(args).filter((item) => {
        const id = item.id as string;
        if (isInProjectGroup(id)) {
          return false;
        }
        return isProject(id) || isTask(id) || isHeading(id);
      });
    }
    if (isTask(activeId)) {
      return closestCenter(args).filter((item) => {
        const id = item.id as string;
        return isProject(id) || isTask(id) || isHeading(id);
      });
    }
    return [];
  };
};
