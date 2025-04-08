import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { AreaInfoState, ITaskModelData, ProjectInfoState } from '../type';
import { getRootCollectionsState } from './getRootCollectionsState';
import { FlattenedItem, flattenedItemsToResult, FlattenedResult } from './flattenedItemsToResult.ts';

interface GetFlattenedRootCollectionsConfig {
  currentDate: number;
  colspanAreaList: string[];
}

export function flattenRootCollections(
  modelData: ITaskModelData,
  config: GetFlattenedRootCollectionsConfig
): FlattenedResult<AreaInfoState, ProjectInfoState> {
  const { currentDate, colspanAreaList } = config;
  const rootCollections = getRootCollectionsState(modelData, currentDate);
  const flattenedItems: FlattenedItem<AreaInfoState, ProjectInfoState>[] = [];
  let index = 0;
  const skipFirstHeader = rootCollections.startedProjects.length > 0;
  rootCollections.startedProjects.forEach((project) => {
    if (project.status !== 'created') {
      return;
    }
    flattenedItems.push({ type: 'item', content: project, id: project.id, index });
    index++;
  });
  if (rootCollections.futureProjects.length > 0) {
    flattenedItems.push({
      type: 'special',
      id: DragDropElements.futureProjects,
      index,
    });
    index++;
  }
  rootCollections.areaList.forEach((area) => {
    if (colspanAreaList.includes(area.id)) {
      flattenedItems.push({
        type: 'header',
        content: area,
        id: area.id,
        index,
        items: [],
      });
      index++;
      return;
    }
    flattenedItems.push({
      type: 'header',
      content: area,
      id: area.id,
      index,
      items: area.projectList.map((project) => project.id),
    });
    index++;
    area.projectList.forEach((project) => {
      if (project.status !== 'created') {
        return;
      }
      flattenedItems.push({ type: 'item', content: project, id: project.id, headerId: area.id, index });
      index++;
    });
  });
  flattenedItems.push({
    type: 'special',
    id: DragDropElements.lastPlacement,
    index,
  });
  index++;
  flattenedItems.push({
    type: 'special',
    id: DragDropElements.create,
    index,
  });
  return flattenedItemsToResult<AreaInfoState, ProjectInfoState>(flattenedItems, skipFirstHeader, undefined);
}
