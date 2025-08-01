import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { AreaInfoState, ITaskModelData, ProjectInfoState } from '../type';
import { FlattenedItem, flattenedItemsToResult, FlattenedResult } from './flattenedItemsToResult.ts';
import { getProjectList } from '../getProject.ts';
import { getAreaList } from '../getAreaState.ts';

interface GetFlattenedRootCollectionsConfig {
  currentDate: number;
  colspanAreaList: string[];
  disableCreate?: boolean;
}

export function flattenRootCollections(
  modelData: ITaskModelData,
  config: GetFlattenedRootCollectionsConfig
): FlattenedResult<AreaInfoState, ProjectInfoState> {
  const { currentDate, colspanAreaList } = config;

  // Get root collections state inline
  const projectList = getProjectList(modelData, modelData.rootObjectIdList);
  const startedProjects = projectList.filter((project) => {
    if (!project.startDate) {
      return true;
    }
    return project.startDate <= currentDate;
  });
  const futureProjects = projectList.filter((project) => {
    if (!project.startDate) {
      return false;
    }
    if (project.status !== 'created') {
      return false;
    }
    return project.startDate > currentDate;
  });
  const areaList = getAreaList(modelData, modelData.rootObjectIdList);

  const rootCollections = {
    startedProjects,
    futureProjects,
    areaList,
  };
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
      if (project.startDate && project.startDate > currentDate) {
        return;
      }
      flattenedItems.push({ type: 'item', content: project, id: project.id, headerId: area.id, index });
      index++;
    });
  });
  if (!config.disableCreate) {
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
  }
  return flattenedItemsToResult<AreaInfoState, ProjectInfoState>(flattenedItems, skipFirstHeader, undefined);
}
