import type { TreeID } from 'loro-crdt';
import { getTaskInfoList } from './getTaskInfo';
import { ITaskModelData, ProjectHeadingInfo } from './type';

export function getProjectHeadingInfo(modelData: ITaskModelData, projectHeadingId: string): ProjectHeadingInfo {
  const objectData = modelData.taskObjectMap.get(projectHeadingId);
  if (!objectData || objectData.type !== 'projectHeading') {
    throw new Error('invalid project heading id');
  }

  return {
    id: objectData.id,
    title: objectData.title,
    parentId: objectData.parentId,
    tasks: getTaskInfoList(modelData, objectData.children),
    isArchived: objectData.isArchived,
    archivedDate: objectData.archivedDate,
  };
}

export function getProjectHeadingInfoList(
  modelData: ITaskModelData,
  projectHeadingIdList: TreeID[]
): ProjectHeadingInfo[] {
  return projectHeadingIdList
    .map((projectHeadingId) => {
      const o = modelData.taskObjectMap.get(projectHeadingId);
      if (!o || o.type !== 'projectHeading') {
        return null;
      }
      return getProjectHeadingInfo(modelData, projectHeadingId);
    })
    .filter((projectHeading) => projectHeading !== null);
}
