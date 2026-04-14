import type { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import type { TreeSelectController } from './TreeSelectController';

export interface SelectionState {
  currentAreaId: TreeID | null;
  currentProjectId: TreeID | null;
}

export function getSelectionState(controller: TreeSelectController, todoService: ITodoService): SelectionState {
  const emptySelection = {
    currentAreaId: null,
    currentProjectId: null,
  } satisfies SelectionState;
  const currentItem = controller.currentItemId
    ? todoService.modelState.taskObjectMap.get(controller.currentItemId)
    : null;

  if (!currentItem || currentItem.type === 'area' || !currentItem.parentId) {
    return emptySelection;
  }

  const parent = todoService.modelState.taskObjectMap.get(currentItem.parentId);
  if (!parent) {
    return emptySelection;
  }

  if (parent.type === 'area') {
    return {
      currentAreaId: parent.id,
      currentProjectId: null,
    };
  }

  if (parent.type === 'project') {
    const areaParent = parent.parentId ? todoService.modelState.taskObjectMap.get(parent.parentId) : null;
    return {
      currentAreaId: areaParent?.type === 'area' ? areaParent.id : null,
      currentProjectId: parent.id,
    };
  }

  if (parent.type === 'projectHeading') {
    const projectParent = todoService.modelState.taskObjectMap.get(parent.parentId);
    if (projectParent?.type !== 'project') {
      return emptySelection;
    }
    const areaParent = projectParent.parentId ? todoService.modelState.taskObjectMap.get(projectParent.parentId) : null;
    return {
      currentAreaId: areaParent?.type === 'area' ? areaParent.id : null,
      currentProjectId: projectParent.id,
    };
  }

  return emptySelection;
}
