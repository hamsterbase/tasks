import { FlattenedResult } from '@/core/state/home/flattenedItemsToResult.ts';
import { closestCenter, CollisionDetection } from '@dnd-kit/core';
import { cancelCollisionDetection } from './dragDropCollision';

export function getFlattenedItemsCollisionDetectionStrategy(flattenedItemsResult: FlattenedResult): CollisionDetection {
  return (args: Parameters<CollisionDetection>[0]) => {
    const cancelCollisions = cancelCollisionDetection(args);
    if (cancelCollisions.length > 0) {
      return cancelCollisions;
    }
    return closestCenter(args).filter((item) => {
      return flattenedItemsResult.isIgnore(args.active.id as string, item.id as string);
    });
  };
}
