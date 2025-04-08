import { getAreaList } from '../getAreaState.ts';
import { getProjectList } from '../getProject.ts';
import { AreaInfoState, ITaskModelData, ProjectInfoState } from '../type.ts';

export interface IRootCollectionsState {
  startedProjects: ProjectInfoState[];
  futureProjects: ProjectInfoState[];
  areaList: AreaInfoState[];
}
export function getRootCollectionsState(modelData: ITaskModelData, currentDate: number): IRootCollectionsState {
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
  return {
    startedProjects,
    futureProjects,
    areaList: getAreaList(modelData, modelData.rootObjectIdList),
  };
}
