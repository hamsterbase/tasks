import type { TreeID } from 'loro-crdt';
import { ITaskModelData } from './type';

export function getInvalidTaskData(taskData: ITaskModelData) {
  const invalidParentProjects: TreeID[] = [];
  const invalidStatusProjects: TreeID[] = [];

  taskData.taskList.forEach((task) => {
    const taskInfo = taskData.taskObjectMap.get(task.id);
    if (taskInfo?.type === 'project') {
      const parentId = taskInfo.parentId;
      if (parentId) {
        const parentInfo = taskData.taskObjectMap.get(parentId);
        if (parentInfo?.type !== 'area') {
          invalidParentProjects.push(parentId);
        }
      }
      if (taskInfo.status !== 'created') {
        const childTasks = taskInfo.children;
        if (
          childTasks.some((childId) => {
            const childInfo = taskData.taskObjectMap.get(childId);
            if (childInfo?.type === 'task') {
              return childInfo.status === 'created';
            }
            return false;
          })
        ) {
          invalidStatusProjects.push(taskInfo.id);
        }
      }
    }
  });

  return {
    invalidParentProjects,
    invalidStatusProjects,
  };
}
