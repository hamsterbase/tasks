import type { TreeID } from 'loro-crdt';
import { getProjectList } from './getProject.ts';
import { AreaInfoState, ITaskModelData } from './type.ts';

export function getArea(modelData: ITaskModelData, areaId: TreeID): AreaInfoState | null {
  const objectData = modelData.taskObjectMap.get(areaId);
  if (!objectData) {
    return null;
  }
  if (objectData.type !== 'area') {
    return null;
  }

  return {
    title: objectData.title,
    id: objectData.id,
    uid: objectData.uid,
    projectList: getProjectList(modelData, objectData.children),
    tags: objectData.tags,
  };
}

export function getAreaList(modelData: ITaskModelData, areaId: TreeID[]): AreaInfoState[] {
  return areaId.map((id) => getArea(modelData, id)).filter((item) => item !== null) as AreaInfoState[];
}
