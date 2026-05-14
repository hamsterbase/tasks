import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import type { TreeID } from 'loro-crdt';
import { FilterOption, isHeadingVisible, isTaskVisible } from '../time/filterProjectAndTask';
import { getProject } from './getProject';
import { FlattenedItem, flattenedItemsToResult, FlattenedResult } from './home/flattenedItemsToResult.ts';
import { ITaskModelData, ProjectHeadingInfo, TaskInfo } from './type';

export type TagFilter = { type: 'all' } | { type: 'untagged' } | { type: 'tag'; value: string };

export function getProjectHeadingAndTasks({
  modelData,
  projectId,
  option,
  tags = { type: 'all' },
  disableCreateTask = false,
}: {
  modelData: ITaskModelData;
  projectId: TreeID;
  disableCreateTask?: boolean;
  option?: FilterOption;
  tags?: TagFilter;
}): {
  flattenedItemsResult: FlattenedResult<ProjectHeadingInfo, TaskInfo>;
  willDisappearObjectIdSet: Set<TreeID>;
  allTags: string[];
} {
  const flattenedItems: FlattenedItem<ProjectHeadingInfo, TaskInfo>[] = [];
  const project = getProject(modelData, projectId);
  const willDisappearObjectIdSet = new Set<TreeID>();
  if (!project) {
    return {
      flattenedItemsResult: flattenedItemsToResult<ProjectHeadingInfo, TaskInfo>([], false, projectId),
      willDisappearObjectIdSet,
      allTags: [],
    };
  }

  const allTags = new Set<string>();
  const collectTaskTags = (task: TaskInfo) => {
    task.tags?.forEach((tag) => allTags.add(tag));
  };
  project.tasks.forEach(collectTaskTags);
  project.projectHeadings.forEach((projectHeading) => projectHeading.tasks.forEach(collectTaskTags));

  const isTaskMatchedByTags = (task: TaskInfo): boolean => {
    if (tags.type === 'all') {
      return true;
    }
    if (tags.type === 'untagged') {
      return !task.tags || task.tags.length === 0;
    }
    return !!task.tags?.includes(tags.value);
  };

  const getVisibleTaskState = (task: TaskInfo) => {
    const taskVisible = isTaskVisible(task, option);
    if (taskVisible === 'invalid') {
      return 'invalid';
    }
    if (!isTaskMatchedByTags(task) && taskVisible !== 'recentChanged') {
      return 'invalid';
    }
    return taskVisible;
  };

  let index = 0;
  project.tasks.forEach((task) => {
    const taskVisible = getVisibleTaskState(task);
    if (taskVisible === 'invalid') {
      return;
    }
    if (taskVisible === 'recentChanged') {
      willDisappearObjectIdSet.add(task.id);
    }
    flattenedItems.push({ type: 'item', content: task, id: task.id, index });
    index++;
  });
  project.projectHeadings.forEach((projectHeading) => {
    const headingVisible = isHeadingVisible(projectHeading, option);
    if (headingVisible === 'invalid') {
      return;
    }
    if (headingVisible === 'recentChanged') {
      willDisappearObjectIdSet.add(projectHeading.id);
    }
    const headingTaskIds = projectHeading.tasks
      .map((task) => {
        const taskVisible = getVisibleTaskState(task);
        if (taskVisible === 'invalid') {
          return null;
        }
        if (taskVisible === 'recentChanged') {
          willDisappearObjectIdSet.add(task.id);
        }
        return task.id;
      })
      .filter((id) => id !== null);
    if (tags.type !== 'all' && headingTaskIds.length === 0) {
      return;
    }
    flattenedItems.push({
      type: 'header',
      content: projectHeading,
      id: projectHeading.id,
      index,
      items: headingTaskIds,
    });
    index++;
    projectHeading.tasks.forEach((task) => {
      const taskVisible = getVisibleTaskState(task);
      if (taskVisible === 'invalid') {
        return;
      }
      if (taskVisible === 'recentChanged') {
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
    allTags: Array.from(allTags).sort(),
  };
}
