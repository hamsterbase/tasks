import type { ITaskModelData, TaskObjectSchema } from '@/core/type';

/**
 * `modelData.taskList` is a faithful mirror of every node in the Loro tree,
 * including sub-tasks (a `task` whose parent is another `task`). Sub-tasks
 * are implementation details of their parent — they're never first-class
 * citizens in cross-cutting lists (Inbox / Today / Scheduled / Completed all
 * exclude them). This helper applies the same convention so views and search
 * don't accidentally surface sub-tasks as top-level matches.
 */
export function getTopLevelTaskList(modelData: ITaskModelData): TaskObjectSchema[] {
  return modelData.taskList.filter((obj) => {
    if (obj.type !== 'task') return true;
    if (!obj.parentId) return true;
    const parent = modelData.taskObjectMap.get(obj.parentId);
    return parent?.type !== 'task';
  });
}
