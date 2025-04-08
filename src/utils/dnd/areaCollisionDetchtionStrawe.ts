import { closestCenter, CollisionDetection } from '@dnd-kit/core';
import { cancelCollisionDetection, DragDropElements } from './dragDropCollision';

export const areaCollisionDetectionStrategyFactory = (
  isProject: (id: string) => boolean,
  isTask: (id: string) => boolean
) => {
  return (args: Parameters<CollisionDetection>[0]) => {
    const cancelCollisions = cancelCollisionDetection(args);
    if (cancelCollisions.length > 0) {
      return cancelCollisions;
    }
    if (args.active.id === DragDropElements.create) {
      return closestCenter(args).filter(
        (item) => isTask(item.id as string) || item.id === DragDropElements.lastPlacement
      );
    }
    if (isProject(args.active.id as string)) {
      return closestCenter(args).filter((item) => {
        return isProject(item.id as string);
      });
    }
    if (isTask(args.active.id as string)) {
      return closestCenter(args).filter((item) => {
        return isTask(item.id as string);
      });
    }
    return [];
  };
};
