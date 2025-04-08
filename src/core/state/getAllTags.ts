import { ITaskModelData } from '@/core/state/type.ts';
import { ModelTypes } from '../enum';

export function getAllTags(modelData: ITaskModelData) {
  const tagsSet = new Set<string>();
  modelData.taskList
    .map((task) => {
      switch (task.type) {
        case ModelTypes.task:
          return task.tags;
        case ModelTypes.project:
          return task.tags;
        case ModelTypes.area:
          return task.tags;
      }
    })
    .forEach((tags) => {
      (tags ?? []).forEach((tag) => {
        tagsSet.add(tag);
      });
    });

  return Array.from(tagsSet);
}
