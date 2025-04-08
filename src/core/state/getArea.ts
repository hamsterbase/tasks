import type { TreeID } from 'loro-crdt';
import { getProjectList } from './getProject.ts';
import { getTaskInfoList } from './getTaskInfo.ts';
import { AreaDetailState, ITaskModelData } from './type.ts';

export function getAreaDetail(modelData: ITaskModelData, areaId: TreeID): AreaDetailState {
  const objectData = modelData.taskObjectMap.get(areaId);
  if (!objectData) {
    throw new Error('Area not found');
  }
  if (objectData.type !== 'area') {
    throw new Error(`expect area type, but got ${objectData.type}`);
  }
  return {
    title: objectData.title,
    id: objectData.id,
    tags: objectData.tags,
    uid: objectData.uid,
    projectList: getProjectList(modelData, objectData.children),
    taskList: getTaskInfoList(modelData, objectData.children),
  };
}
