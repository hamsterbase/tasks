import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import type { TreeID } from 'loro-crdt';
import { getProject } from './getProject';
import { FlattenedItem, flattenedItemsToResult, FlattenedResult } from './home/flattenedItemsToResult.ts';
import { ITaskModelData, ProjectHeadingInfo, TaskInfo } from './type';
import { FilterOption, isTaskVisible } from '../time/filterProjectAndTask';

export function flattenProjectTaskNew({
  modelData,
  projectId,
  option,
  disableCreateTask = false,
}: {
  modelData: ITaskModelData;
  projectId: TreeID;
  disableCreateTask?: boolean;
  option?: FilterOption;
}): {
  flattenedItemsResult: FlattenedResult<ProjectHeadingInfo, TaskInfo>;
  willDisappearObjectIdSet: Set<TreeID>;
} {
  const flattenedItems: FlattenedItem<ProjectHeadingInfo, TaskInfo>[] = [];
  const project = getProject(modelData, projectId);
  const willDisappearObjectIdSet = new Set<TreeID>();
  if (!project) {
    return {
      flattenedItemsResult: flattenedItemsToResult<ProjectHeadingInfo, TaskInfo>([], false, projectId),
      willDisappearObjectIdSet,
    };
  }

  let index = 0;
  project.tasks.forEach((task) => {
    if (isTaskVisible(task, option) === 'invalid') {
      return;
    }
    if (isTaskVisible(task, option) === 'recentChanged') {
      willDisappearObjectIdSet.add(task.id);
    }
    flattenedItems.push({ type: 'item', content: task, id: task.id, index });
    index++;
  });
  project.projectHeadings.forEach((projectHeading) => {
    flattenedItems.push({
      type: 'header',
      content: projectHeading,
      id: projectHeading.id,
      index,
      items: projectHeading.tasks
        .map((task) => {
          if (isTaskVisible(task, option) === 'invalid') {
            return null;
          }
          if (isTaskVisible(task, option) === 'recentChanged') {
            willDisappearObjectIdSet.add(task.id);
          }
          return task.id;
        })
        .filter((id) => id !== null),
    });
    index++;
    projectHeading.tasks.forEach((task) => {
      if (isTaskVisible(task, option) === 'invalid') {
        return;
      }
      if (isTaskVisible(task, option) === 'recentChanged') {
        willDisappearObjectIdSet.add(task.id);
      }
      flattenedItems.push({ type: 'item', content: task, id: task.id, headerId: projectHeading.id, index });
      index++;
    });
  });
  if (!disableCreateTask) {
    flattenedItems.push({ type: 'special', id: DragDropElements.lastPlacement, index });
    index++;
    flattenedItems.push({ type: 'special', id: DragDropElements.create, index });
  }
  return {
    flattenedItemsResult: flattenedItemsToResult(flattenedItems, false, projectId),
    willDisappearObjectIdSet,
  };
}
