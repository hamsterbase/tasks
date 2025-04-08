import { ItemStatusEnum } from '../enum.ts';
import { getAreaList } from './getAreaState.ts';
import { getProjectList } from './getProject.ts';
import { AreaInfoState, ITaskModelData, ProjectInfoState } from './type.ts';

export interface IRootCollectionsState {
  filteredProjects: ProjectInfoState[];
  filteredAreas: AreaInfoState[];
}
export function getAllProject(modelData: ITaskModelData, searchText: string): IRootCollectionsState {
  const projectList = getProjectList(modelData, modelData.rootObjectIdList);
  const projects = projectList.filter((project) => {
    return project.status === ItemStatusEnum.created;
  });
  const filteredProjects = projects.filter((project) => project.title.toLowerCase().includes(searchText.toLowerCase()));
  const areaList = getAreaList(modelData, modelData.rootObjectIdList);

  const filteredAreas = areaList
    .map((area) => ({
      ...area,
      projectList: area.projectList
        .filter((o) => o.status === ItemStatusEnum.created)
        .filter((project) => project.title.toLowerCase().includes(searchText.toLowerCase())),
    }))
    .filter((area) => area.title.toLowerCase().includes(searchText.toLowerCase()) || area.projectList.length > 0);

  return {
    filteredProjects,
    filteredAreas,
  };
}
