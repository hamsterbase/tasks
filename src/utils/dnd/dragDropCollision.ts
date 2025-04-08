import { CollisionDetection, pointerWithin } from '@dnd-kit/core';

export const DragDropElements = {
  create: 'create',
  inbox: 'inbox',
  cancel: 'cancel',
  lastPlacement: 'lastPlacement',
  futureProjects: 'futureProjects',
};

const droppableElements = new Set([DragDropElements.inbox, DragDropElements.cancel]);

export const cancelCollisionDetection = (args: Parameters<CollisionDetection>[0]) => {
  if (args.active.id === DragDropElements.create) {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions && pointerCollisions.length > 0) {
      for (const collision of pointerCollisions) {
        if (droppableElements.has(collision.id as string)) {
          return [{ id: collision.id }];
        }
      }
    }
  }
  return [];
};
