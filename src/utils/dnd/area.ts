import { AreaDetailState, isProject, isTask, ITaskModelData } from '@/core/state/type';
import { ItemPosition } from '@/core/type';
import type { TreeID } from 'loro-crdt';
import { DragDropElements } from './dragDropCollision';

export type DragEndPositionAction =
  | {
      type: 'createTask';
      position: ItemPosition;
    }
  | {
      type: 'move';
      activeId: TreeID;
      moveType: 'task' | 'project';
      position: ItemPosition;
    };

export function getAreaDragEndPositionAction(
  activeId: TreeID,
  overId: TreeID,
  areaDetail: AreaDetailState,
  modelData: ITaskModelData
): DragEndPositionAction | null {
  if (activeId === DragDropElements.create) {
    const overTask = areaDetail.taskList.find((task) => task.id === overId);
    if (overTask) {
      return {
        type: 'createTask',
        position: {
          type: 'beforeElement',
          nextElementId: overId,
        },
      };
    } else {
      if (areaDetail.taskList.length > 0) {
        return {
          type: 'createTask',
          position: {
            type: 'afterElement',
            previousElementId: areaDetail.taskList[areaDetail.taskList.length - 1].id,
          },
        };
      } else {
        return {
          type: 'createTask',
          position: {
            type: 'firstElement',
            parentId: areaDetail.id,
          },
        };
      }
    }
  } else {
    if (isTask(modelData, activeId)) {
      const itemIndex = areaDetail.taskList.findIndex((task) => task.id === activeId);
      const overTaskIndex = areaDetail.taskList.findIndex((task) => task.id === overId);
      if (itemIndex < overTaskIndex) {
        return {
          type: 'move',
          activeId,
          moveType: 'task',
          position: {
            type: 'afterElement',
            previousElementId: overId,
          },
        };
      } else if (itemIndex > overTaskIndex) {
        return {
          type: 'move',
          activeId,
          moveType: 'task',
          position: {
            type: 'beforeElement',
            nextElementId: overId,
          },
        };
      }
    }
    if (isProject(modelData, activeId)) {
      const itemIndex = areaDetail.projectList.findIndex((project) => project.id === activeId);
      const overProjectIndex = areaDetail.projectList.findIndex((project) => project.id === overId);
      if (itemIndex < overProjectIndex) {
        return {
          type: 'move',
          activeId,
          moveType: 'project',
          position: {
            type: 'afterElement',
            previousElementId: overId,
          },
        };
      } else if (itemIndex > overProjectIndex) {
        return {
          type: 'move',
          activeId,
          moveType: 'project',
          position: {
            type: 'beforeElement',
            nextElementId: overId,
          },
        };
      }
    }
  }
  return null;
}
