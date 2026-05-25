import type { ITaskModelData, TaskViewSchema } from '../../type.ts';

export function getAllViews(modelData: ITaskModelData): TaskViewSchema[] {
  return modelData.views;
}
