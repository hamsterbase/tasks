import { getProjectList } from '../getProject.ts';
import { ITaskModelData, ProjectInfoState } from '../type.ts';

export function getFutureProjects(modelData: ITaskModelData, currentDate: number): ProjectInfoState[] {
  const projectList = getProjectList(modelData, modelData.rootObjectIdList);
  const futureProjects = projectList.filter((project) => {
    if (!project.startDate) {
      return false;
    }
    if (project.status !== 'created') {
      return false;
    }
    return project.startDate > currentDate;
  });
  return futureProjects;
}
