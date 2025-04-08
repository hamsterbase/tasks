import { CollisionDetection } from '@dnd-kit/core';

import { cancelCollisionDetection } from './dragDropCollision';

import { closestCenter } from '@dnd-kit/core';
import { DragDropElements } from './dragDropCollision';

export const singleListCollisionDetectionStrategy: CollisionDetection = (args: Parameters<CollisionDetection>[0]) => {
  const cancelCollisions = cancelCollisionDetection(args);
  if (cancelCollisions.length > 0) {
    return cancelCollisions;
  }

  if (args.active.id === DragDropElements.create) {
    return closestCenter(args);
  }

  return closestCenter(args).filter(
    (item) => ![DragDropElements.lastPlacement, DragDropElements.create].includes(item.id as string)
  );
};
