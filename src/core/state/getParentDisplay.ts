import { ItemStatus } from '@/core/type';
import { localize } from '@/nls';
import { TreeID } from 'loro-crdt';
import { getProject } from './getProject';
import { getTaskInfo } from './getTaskInfo';
import { ITaskModelData } from './type';

export interface ParentDisplay {
  icon:
    | {
        type: 'project';
        progress: number;
        status: ItemStatus;
        color: string;
      }
    | {
        type: 'area';
      };
  title: string;
}

export function getParentDisplay(modelState: ITaskModelData, itemId: TreeID): ParentDisplay | null {
  const item = modelState.taskObjectMap.get(itemId);
  if (!item) return null;

  if (item.type === 'task') {
    if (!item.parentId) {
      return null;
    }
    const taskInfo = getTaskInfo(modelState, itemId);
    if (taskInfo.parentId) {
      const parentObject = modelState.taskObjectMap.get(taskInfo.parentId);
      if (parentObject?.type === 'area') {
        return {
          icon: {
            type: 'area',
          },
          title: parentObject.title || localize('area.untitled', 'New Area'),
        };
      }
      if (parentObject?.type === 'project') {
        const projectInfo = getProject(modelState, parentObject.id);
        return {
          icon: {
            type: 'project',
            progress: projectInfo.progress,
            status: projectInfo.status,
            color: 't3',
          },
          title: parentObject.title || localize('project.untitled', 'New Project'),
        };
      }
      if (parentObject?.type === 'projectHeading') {
        const projectInfo = getProject(modelState, parentObject.parentId);
        return {
          icon: {
            type: 'project',
            progress: projectInfo.progress,
            status: projectInfo.status,
            color: 't3',
          },
          title: parentObject.title || localize('project.untitled', 'New Project'),
        };
      }
    }
  }

  if (item.type === 'project') {
    if (!item.parentId) {
      return null;
    }

    const parentObject = modelState.taskObjectMap.get(item.parentId);
    if (parentObject?.type === 'area') {
      return {
        icon: {
          type: 'area',
        },
        title: parentObject.title,
      };
    }
  }

  return null;
}
