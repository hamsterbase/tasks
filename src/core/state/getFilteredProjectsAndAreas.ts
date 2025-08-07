import { getAllProject } from './getAllProject.ts';
import { AreaInfoState, ITaskModelData, ProjectInfoState } from './type.ts';
import { TreeID } from 'loro-crdt';
import { localize } from '@/nls';

export interface FilteredProjectInfo extends ProjectInfoState {
  isPlaceholder: boolean;
  displayTitle: string;
}

export interface FilteredAreaInfo extends AreaInfoState {
  isPlaceholder: boolean;
  displayTitle: string;
  isDisabled?: boolean;
  projectList: FilteredProjectInfo[];
}

export interface FilteredProjectsAndAreas {
  canMoveToRoot: boolean;
  filteredProjects: FilteredProjectInfo[];
  filteredAreas: FilteredAreaInfo[];
}

export function getFilteredProjectsAndAreas(
  modelData: ITaskModelData,
  searchText: string,
  itemId: TreeID
): FilteredProjectsAndAreas {
  const { filteredProjects, filteredAreas } = getAllProject(modelData, searchText);

  const currentItem = itemId ? modelData.taskObjectMap.get(itemId) : null;
  const isCurrentItemProject = currentItem?.type === 'project';
  const isCurrentItemHeading = currentItem?.type === 'projectHeading';

  const placeholderTitle = localize('project.untitled', 'New Project');

  const projectsWithMetadata: FilteredProjectInfo[] = filteredProjects.map((project) => ({
    ...project,
    isPlaceholder: !project.title,
    displayTitle: project.title || placeholderTitle,
  }));

  const areasWithMetadata: FilteredAreaInfo[] = filteredAreas.map((area) => ({
    ...area,
    isPlaceholder: !area.title,
    displayTitle: area.title || placeholderTitle,
    isDisabled: isCurrentItemHeading,
    projectList: area.projectList.map((project) => ({
      ...project,
      isPlaceholder: !project.title,
      displayTitle: project.title || placeholderTitle,
    })),
  }));

  if (isCurrentItemHeading) {
    return {
      canMoveToRoot: true,
      filteredProjects: projectsWithMetadata,
      filteredAreas: areasWithMetadata,
    };
  } else if (isCurrentItemProject) {
    return {
      canMoveToRoot: true,
      filteredProjects: [],
      filteredAreas: areasWithMetadata.map((area) => ({
        ...area,
        projectList: [],
      })),
    };
  } else {
    return {
      canMoveToRoot: true,
      filteredProjects: projectsWithMetadata,
      filteredAreas: areasWithMetadata,
    };
  }
}
