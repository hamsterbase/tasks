import { localize } from '@/nls';
import { TreeID } from 'loro-crdt';
import { ItemStatus } from '@/core/type';
import { FilteredProjectsAndAreas } from './getFilteredProjectsAndAreas';

export type TreeSelectItem = {
  id: TreeID | null;
  label: string;
  disabled?: boolean;
} & ({ type: 'root' } | { type: 'area' } | { type: 'project'; progress: number; status: ItemStatus });

export function getTreeSelectItems(data: FilteredProjectsAndAreas): TreeSelectItem[] {
  const flattenedItems: TreeSelectItem[] = [];

  if (data.canMoveToRoot) {
    flattenedItems.push({
      type: 'root',
      id: null,
      label: localize('project_area_selector.move_to_root', 'Move to root'),
    });
  }

  data.filteredProjects.forEach((project) => {
    flattenedItems.push({
      type: 'project',
      id: project.id,
      label: project.displayTitle,
      progress: project.progress,
      status: project.status,
    });
  });

  data.filteredAreas.forEach((area) => {
    flattenedItems.push({
      type: 'area',
      id: area.id,
      label: area.displayTitle,
      disabled: area.isDisabled,
    });

    area.projectList.forEach((project) => {
      flattenedItems.push({
        type: 'project',
        id: project.id,
        label: project.displayTitle,
        progress: project.progress,
        status: project.status,
      });
    });
  });

  return flattenedItems;
}
